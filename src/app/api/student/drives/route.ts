import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get query params
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      isActive: true,
      registrationEnd: { gte: new Date() },
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { role: { contains: search, mode: "insensitive" as const } },
          {
            company: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }),
    };

    // Get drives
    const [drives, total] = await Promise.all([
      prisma.drive.findMany({
        where,
        include: {
          company: true,
          applications: {
            where: { studentId: student.id },
          },
        },
        orderBy: { registrationEnd: "asc" },
        skip,
        take: limit,
      }),
      prisma.drive.count({ where }),
    ]);

    // Add eligibility info to each drive
    const drivesWithEligibility = drives.map((drive) => {
      const eligibility = checkEligibility(student, drive);
      const hasApplied = drive.applications.length > 0;

      return {
        id: drive.id,
        company: {
          id: drive.company.id,
          name: drive.company.name,
          logo: drive.company.logo,
          sector: drive.company.sector,
          tier: drive.company.tier,
        },
        title: drive.title,
        role: drive.role,
        jobDescription: drive.jobDescription,
        ctc: drive.ctc,
        ctcBreakup: drive.ctcBreakup,
        location: drive.location,
        bond: drive.bond,
        techStack: drive.techStack,
        positionsAvailable: drive.positionsAvailable,
        minCgpa: drive.minCgpa,
        maxBacklogs: drive.maxBacklogs,
        allowedBranches: drive.allowedBranches
          ? drive.allowedBranches.split(',').map(b => b.trim())
          : [],
        registrationStart: drive.registrationStart,
        registrationEnd: drive.registrationEnd,
        isActive: drive.isActive,
        isEligible: eligibility.isEligible,
        hasApplied,
        applicationStatus: hasApplied ? drive.applications[0].status : undefined,
      };
    });

    return NextResponse.json({
      drives: drivesWithEligibility,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching drives:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
