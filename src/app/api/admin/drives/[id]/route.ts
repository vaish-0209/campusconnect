import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drive = await prisma.drive.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
        events: {
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    // Parse techStack and allowedBranches from strings to arrays
    const techStack = drive.techStack
      ? (typeof drive.techStack === 'string' ? drive.techStack.split(',').map(t => t.trim()) : drive.techStack)
      : [];

    const allowedBranches = drive.allowedBranches
      ? (typeof drive.allowedBranches === 'string' ? drive.allowedBranches.split(',').map(b => b.trim()) : drive.allowedBranches)
      : [];

    return NextResponse.json({
      drive: {
        ...drive,
        techStack,
        allowedBranches,
        applicationsCount: drive.applications.length,
        shortlistedCount: drive.applications.filter((a) =>
          ["SHORTLISTED", "TEST_CLEARED", "INTERVIEW_CLEARED"].includes(a.status)
        ).length,
        offersCount: drive.applications.filter((a) => a.status === "OFFER").length,
      }
    });
  } catch (error) {
    console.error("Error fetching drive:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateDriveSchema = z.object({
  title: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  jobDescription: z.string().min(1).optional(),
  ctc: z.number().positive().optional(),
  ctcBreakup: z.string().optional(),
  location: z.string().optional(),
  bond: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  minCgpa: z.number().min(0).max(10).optional(),
  maxBacklogs: z.number().min(0).optional(),
  allowedBranches: z.array(z.string()).optional(),
  registrationStart: z.string().datetime().optional(),
  registrationEnd: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = updateDriveSchema.parse(body);

    const updateData: any = { ...data };

    if (data.registrationStart) {
      updateData.registrationStart = new Date(data.registrationStart);
    }
    if (data.registrationEnd) {
      updateData.registrationEnd = new Date(data.registrationEnd);
    }

    const drive = await prisma.drive.update({
      where: { id: params.id },
      data: updateData,
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email || "",
      action: "UPDATE",
      target: "Drive",
      targetId: params.id,
      meta: {
        updatedFields: Object.keys(data),
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Drive updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating drive:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
