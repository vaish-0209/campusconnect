import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/student/calendar - Get events relevant to the student
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student info
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        applications: {
          select: { driveId: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get applied drive IDs
    const appliedDriveIds = student.applications.map((app) => app.driveId);

    // Fetch events:
    // 1. General events (no driveId)
    // 2. Events for drives the student has applied to
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { driveId: null }, // General events
          { driveId: { in: appliedDriveIds } }, // Applied drives
        ],
        ...(startDate && {
          startTime: { gte: new Date(startDate) },
        }),
        ...(endDate && {
          endTime: { lte: new Date(endDate) },
        }),
      },
      include: {
        drive: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching student calendar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
