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

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sector: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(sector && { sector }),
    };

    const companies = await prisma.company.findMany({
      where,
      include: {
        drives: {
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const companiesWithCount = companies.map((company) => ({
      id: company.id,
      name: company.name,
      logo: company.logo,
      sector: company.sector,
      tier: company.tier,
      website: company.website,
      drivesCount: company.drives.length,
      createdAt: company.createdAt,
    }));

    return NextResponse.json({ companies: companiesWithCount });
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
  logo: z.string().url().optional(),
  sector: z.string().min(1, "Sector is required"),
  tier: z.string().optional(),
  website: z.string().url().optional(),
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
        logo: data.logo,
        sector: data.sector,
        tier: data.tier,
        website: data.website,
      },
    });

    return NextResponse.json(
      { success: true, company },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
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
