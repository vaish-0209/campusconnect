import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().url().optional().or(z.literal("")),
  sector: z.string().min(1).optional(),
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const company = await prisma.company.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if company has drives
    const drivesCount = await prisma.drive.count({
      where: { companyId: params.id },
    });

    if (drivesCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete company with existing drives",
          drivesCount,
        },
        { status: 409 }
      );
    }

    await prisma.company.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
