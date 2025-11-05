import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const driveId = searchParams.get("driveId");

    const applications = await prisma.application.findMany({
      where: driveId && driveId !== "all" ? { driveId } : {},
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNo: true,
            branch: true,
            cgpa: true,
            backlogs: true,
          },
        },
        drive: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
