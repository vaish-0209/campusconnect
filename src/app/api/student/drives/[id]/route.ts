import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const drive = await prisma.drive.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        events: {
          orderBy: { startTime: "asc" },
        },
        applications: {
          where: { studentId: student.id },
        },
      },
    });

    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }

    const eligibility = checkEligibility(student, drive);
    const application = drive.applications[0] || null;

    return NextResponse.json({
      id: drive.id,
      company: {
        id: drive.company.id,
        name: drive.company.name,
        logo: drive.company.logo,
        sector: drive.company.sector,
        tier: drive.company.tier,
        website: drive.company.website,
      },
      title: drive.title,
      role: drive.role,
      jobDescription: drive.jobDescription,
      ctc: drive.ctc,
      ctcBreakup: drive.ctcBreakup,
      location: drive.location,
      bond: drive.bond,
      techStack: drive.techStack,
      minCgpa: drive.minCgpa,
      maxBacklogs: drive.maxBacklogs,
      allowedBranches: drive.allowedBranches,
      registrationStart: drive.registrationStart,
      registrationEnd: drive.registrationEnd,
      events: drive.events.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        meetingLink: event.meetingLink,
      })),
      eligibility: {
        isEligible: eligibility.isEligible,
        reasons: eligibility.reasons,
      },
      application: application
        ? {
            id: application.id,
            status: application.status,
            appliedAt: application.appliedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching drive:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
