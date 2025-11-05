import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const sector = searchParams.get("sector") || "";

    const where: any = {};

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sector: { contains: search } },
      ];
    }

    // Add sector filter
    if (sector) {
      where.sector = sector;
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        drives: {
          select: {
            id: true,
            applications: {
              select: {
                id: true,
                status: true,
              }
            }
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const companiesWithStats = companies.map((company) => {
      const totalApplications = company.drives.reduce((sum, drive) => sum + drive.applications.length, 0);
      const totalOffers = company.drives.reduce((sum, drive) =>
        sum + drive.applications.filter(app => app.status === "OFFER").length, 0
      );

      return {
        id: company.id,
        name: company.name,
        logo: company.logo,
        sector: company.sector,
        website: company.website,
        description: company.description,
        packageRange: company.packageRange,
        eligibilityMinCGPA: company.eligibilityMinCGPA,
        eligibilityMaxBacklogs: company.eligibilityMaxBacklogs,
        eligibilityBranches: company.eligibilityBranches,
        hrContactName: company.hrContactName,
        hrContactEmail: company.hrContactEmail,
        hrContactPhone: company.hrContactPhone,
        drivesCount: company.drives.length,
        totalApplications,
        totalOffers,
        createdAt: company.createdAt,
      };
    });

    return NextResponse.json({ companies: companiesWithStats });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  logo: z.string().url().optional().or(z.literal("")),
  sector: z.string().min(1, "Sector is required"),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  packageRange: z.string().optional(),
  eligibilityMinCGPA: z.number().min(0).max(10).optional(),
  eligibilityMaxBacklogs: z.number().min(0).optional(),
  eligibilityBranches: z.string().optional(),
  hrContactName: z.string().optional(),
  hrContactEmail: z.string().email().optional().or(z.literal("")),
  hrContactPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    // Check if company already exists
    const existing = await prisma.company.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Company with this name already exists" },
        { status: 409 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        sector: data.sector,
        website: data.website || null,
        description: data.description,
        packageRange: data.packageRange,
        eligibilityMinCGPA: data.eligibilityMinCGPA,
        eligibilityMaxBacklogs: data.eligibilityMaxBacklogs,
        eligibilityBranches: data.eligibilityBranches,
        hrContactName: data.hrContactName,
        hrContactEmail: data.hrContactEmail || null,
        hrContactPhone: data.hrContactPhone,
      },
    });

    return NextResponse.json(
      { success: true, company },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
