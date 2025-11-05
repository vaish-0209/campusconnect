import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const companyId = searchParams.get("companyId");
    const companyName = searchParams.get("company");
    const isActive = searchParams.get("isActive");
    const activeFilter = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    console.log("🔍 Drive API Query Params:", { search, companyId, companyName, isActive, activeFilter, page, limit });

    const where: any = {};
    const conditions: any[] = [];

    // Add company filter by ID
    if (companyId) {
      conditions.push({ companyId });
    }

    // Add company filter by name
    if (companyName) {
      conditions.push({
        company: {
          name: companyName,
        },
      });
    }

    // Add search filter
    if (search) {
      const searchConditions = [
        { title: { contains: search } },
        { role: { contains: search } },
      ];

      // Only add company name search if not already filtering by company
      if (!companyName && !companyId) {
        searchConditions.push({
          company: {
            name: { contains: search },
          },
        });
      }

      conditions.push({ OR: searchConditions });
    }

    // Add active status filter
    if (isActive !== null && isActive !== undefined) {
      conditions.push({ isActive: isActive === "true" });
    } else if (activeFilter && activeFilter !== "all") {
      conditions.push({ isActive: activeFilter === "true" });
    }

    // Combine all conditions with AND
    if (conditions.length > 0) {
      where.AND = conditions;
    }

    console.log("📊 Prisma WHERE clause:", JSON.stringify(where, null, 2));

    const [drives, total] = await Promise.all([
      prisma.drive.findMany({
        where,
        include: {
          company: true,
          applications: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.drive.count({ where }),
    ]);

    const drivesWithStats = drives.map((drive) => ({
      id: drive.id,
      company: {
        id: drive.company.id,
        name: drive.company.name,
        logo: drive.company.logo,
      },
      title: drive.title,
      role: drive.role,
      ctc: drive.ctc,
      location: drive.location,
      registrationStart: drive.registrationStart,
      registrationEnd: drive.registrationEnd,
      isActive: drive.isActive,
      applicationsCount: drive.applications.length,
      shortlistedCount: drive.applications.filter((a) =>
        ["SHORTLISTED", "TEST_CLEARED", "INTERVIEW_CLEARED"].includes(
          a.status
        )
      ).length,
      offersCount: drive.applications.filter((a) => a.status === "OFFER")
        .length,
      createdAt: drive.createdAt,
    }));

    return NextResponse.json({
      drives: drivesWithStats,
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

const createDriveSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  role: z.string().min(1, "Role is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  ctc: z.number().positive().optional(),
  ctcBreakup: z.string().optional(),
  location: z.string().optional(),
  bond: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  minCgpa: z.number().min(0).max(10).optional(),
  maxBacklogs: z.number().min(0).default(0),
  allowedBranches: z.array(z.string()).default([]),
  registrationStart: z.string().datetime(),
  registrationEnd: z.string().datetime(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createDriveSchema.parse(body);

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Validate dates
    const startDate = new Date(data.registrationStart);
    const endDate = new Date(data.registrationEnd);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "Registration end date must be after start date" },
        { status: 400 }
      );
    }

    const drive = await prisma.drive.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        role: data.role,
        jobDescription: data.jobDescription,
        ctc: data.ctc,
        ctcBreakup: data.ctcBreakup,
        location: data.location,
        bond: data.bond,
        techStack: data.techStack,
        minCgpa: data.minCgpa,
        maxBacklogs: data.maxBacklogs,
        allowedBranches: data.allowedBranches,
        registrationStart: startDate,
        registrationEnd: endDate,
        isActive: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email || "",
      action: "CREATE",
      target: "Drive",
      targetId: drive.id,
      meta: {
        title: drive.title,
        companyId: drive.companyId,
        ctc: drive.ctc,
      },
      req,
    });

    // TODO: Create notification for eligible students

    return NextResponse.json(
      {
        success: true,
        drive: { id: drive.id, title: drive.title },
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

    console.error("Error creating drive:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
