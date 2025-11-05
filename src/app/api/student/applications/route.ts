import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";
import { z } from "zod";

// GET - List all applications for logged-in student
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      studentId: student.id,
      ...(status && { status }),
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          drive: {
            include: {
              company: true,
            },
          },
        },
        orderBy: { appliedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications: applications.map((app) => ({
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        resumeUrl: app.resumeUrl,
        remarks: app.remarks,
        drive: {
          id: app.drive.id,
          company: {
            name: app.drive.company.name,
            logo: app.drive.company.logo,
          },
          title: app.drive.title,
          role: app.drive.role,
          ctc: app.drive.ctc,
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Apply to a drive
const applySchema = z.object({
  driveId: z.string(),
  resumeUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { driveId, resumeUrl } = applySchema.parse(body);

    // Check if drive exists
    const drive = await prisma.drive.findUnique({
      where: { id: driveId },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    // Auto-attach resume from profile if not provided
    const finalResumeUrl = resumeUrl || student.resume || undefined;

    // Check if registration is open
    const now = new Date();
    if (now < drive.registrationStart || now > drive.registrationEnd) {
      return NextResponse.json(
        { error: "Registration is not open for this drive" },
        { status: 400 }
      );
    }

    // Check eligibility
    const eligibility = checkEligibility(student, drive);
    if (!eligibility.isEligible) {
      return NextResponse.json(
        {
          error: "NOT_ELIGIBLE",
          message: "You are not eligible for this drive",
          reasons: eligibility.reasons,
        },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_driveId: {
          studentId: student.id,
          driveId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          error: "ALREADY_APPLIED",
          message: "You have already applied to this drive",
        },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        driveId,
        resumeUrl: finalResumeUrl,
        status: "APPLIED",
      },
    });

    // TODO: Create notification
    // TODO: Create audit log

    return NextResponse.json(
      {
        success: true,
        applicationId: application.id,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
