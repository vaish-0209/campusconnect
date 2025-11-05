import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get drive details
    const drive = await prisma.drive.findUnique({
      where: { id },
      include: {
        company: true,
        applications: {
          where: { studentId: student.id },
        },
      },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    // Check eligibility
    const eligibility = checkEligibility(student, drive);
    const hasApplied = drive.applications.length > 0;

    const driveDetails = {
      id: drive.id,
      company: {
        name: drive.company.name,
        logo: drive.company.logo,
        sector: drive.company.sector,
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

    return NextResponse.json(driveDetails);
  } catch (error) {
    console.error("Error fetching drive details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
