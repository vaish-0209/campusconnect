import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recommendDrives, getStudentInsights } from "@/lib/recommendationEngine";

export async function GET(req: Request) {
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

    // Get all active drives
    const drives = await prisma.drive.findMany({
      where: {
        isActive: true,
        registrationEnd: { gte: new Date() },
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
            sector: true,
          },
        },
        applications: {
          where: {
            studentId: student.id,
          },
        },
      },
    });

    // Filter out drives already applied to
    const unappliedDrives = drives.filter((drive) => drive.applications.length === 0);

    // Get recommendations
    const recommendations = recommendDrives(
      {
        cgpa: student.cgpa,
        branch: student.branch,
        backlogs: student.backlogs,
        skills: student.skills,
      },
      unappliedDrives
    );

    // Get insights
    const insights = getStudentInsights(
      {
        cgpa: student.cgpa,
        branch: student.branch,
        backlogs: student.backlogs,
        skills: student.skills,
      },
      drives
    );

    return NextResponse.json({
      recommendations,
      insights,
      totalDrives: drives.length,
      unappliedDrives: unappliedDrives.length,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
