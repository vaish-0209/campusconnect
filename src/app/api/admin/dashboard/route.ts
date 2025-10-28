import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get stats
    const [
      totalStudents,
      activeStudents,
      totalDrives,
      activeDrives,
      totalCompanies,
      recentApplications,
      upcomingDrives,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
      prisma.drive.count(),
      prisma.drive.count({ where: { isActive: true } }),
      prisma.company.count(),
      prisma.application.findMany({
        take: 5,
        orderBy: { appliedAt: "desc" },
        include: {
          student: { select: { firstName: true, lastName: true } },
          drive: {
            select: { title: true, company: { select: { name: true } } },
          },
        },
      }),
      prisma.drive.findMany({
        where: {
          isActive: true,
          registrationEnd: { gte: new Date() },
        },
        take: 5,
        orderBy: { registrationEnd: "asc" },
        include: {
          company: { select: { name: true } },
        },
      }),
    ]);

    // Get unique students with OFFER status
    const offeredApplications = await prisma.application.findMany({
      where: { status: "OFFER" },
      select: { studentId: true },
    });
    const placedStudents = new Set(
      offeredApplications.map((a) => a.studentId)
    ).size;

    return NextResponse.json({
      totalStudents,
      activeStudents,
      totalCompanies,
      activeDrives,
      placedStudents,
      recentApplications: recentApplications.map((app) => ({
        id: app.id,
        studentName: `${app.student.firstName} ${app.student.lastName}`,
        companyName: app.drive.company.name,
        status: app.status,
        appliedAt: app.appliedAt.toISOString(),
      })),
      upcomingDrives: upcomingDrives.map((drive) => ({
        id: drive.id,
        companyName: drive.company.name,
        role: drive.title,
        deadline: drive.registrationEnd.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
