import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const branch = searchParams.get("branch") || "";
    const minCgpa = searchParams.get("minCgpa");
    const maxBacklogs = searchParams.get("maxBacklogs");
    const isPlaced = searchParams.get("isPlaced");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { rollNo: { contains: search, mode: "insensitive" as const } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
      ...(branch && { branch }),
      ...(minCgpa && { cgpa: { gte: parseFloat(minCgpa) } }),
      ...(maxBacklogs !== null && { backlogs: { lte: parseInt(maxBacklogs || "0") } }),
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              isActive: true,
              lastLoginAt: true,
            },
          },
          applications: {
            select: {
              status: true,
            },
          },
        },
        orderBy: { rollNo: "asc" },
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    // Calculate stats for each student
    const studentsWithStats = students.map((student) => {
      const applicationsCount = student.applications.length;
      const offersCount = student.applications.filter(
        (app) => app.status === "OFFER"
      ).length;

      return {
        id: student.id,
        rollNo: student.rollNo,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.user.email,
        branch: student.branch,
        cgpa: student.cgpa,
        backlogs: student.backlogs,
        phone: student.phone,
        isActive: student.user.isActive,
        lastLoginAt: student.user.lastLoginAt,
        applicationsCount,
        offersCount,
      };
    });

    return NextResponse.json({
      students: studentsWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
