import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "";
    const branch = searchParams.get("branch") || "";
    const minCgpa = searchParams.get("minCgpa");

    const where: any = {
      driveId: params.id,
      ...(status && { status }),
      ...(branch && { student: { branch } }),
      ...(minCgpa && { student: { cgpa: { gte: parseFloat(minCgpa) } } }),
    };

    const applications = await prisma.application.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    const applicationsData = applications.map((app) => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      resumeUrl: app.resumeUrl,
      remarks: app.remarks,
      student: {
        id: app.student.id,
        rollNo: app.student.rollNo,
        firstName: app.student.firstName,
        lastName: app.student.lastName,
        email: app.student.user.email,
        branch: app.student.branch,
        cgpa: app.student.cgpa,
        backlogs: app.student.backlogs,
        phone: app.student.phone,
      },
    }));

    return NextResponse.json({ applications: applicationsData });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
