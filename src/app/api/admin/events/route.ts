import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/admin/events - List all events with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");
    const driveId = searchParams.get("driveId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      ...(type && { type }),
      ...(driveId && { driveId }),
      ...(startDate && {
        startTime: { gte: new Date(startDate) },
      }),
      ...(endDate && {
        endTime: { lte: new Date(endDate) },
      }),
    };

    const events = await prisma.event.findMany({
      where,
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
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["PPT", "TEST", "INTERVIEW", "OTHER"]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  venue: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  driveId: z.string().optional(),
});

// POST /api/admin/events - Create new event
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createEventSchema.parse(body);

    // Validate dates
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // If driveId provided, verify it exists
    if (data.driveId) {
      const drive = await prisma.drive.findUnique({
        where: { id: data.driveId },
      });

      if (!drive) {
        return NextResponse.json(
          { error: "Drive not found" },
          { status: 404 }
        );
      }
    }

    // Check for conflicts (same venue, overlapping time)
    if (data.venue) {
      const conflicts = await prisma.event.findMany({
        where: {
          venue: data.venue,
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
        include: {
          drive: {
            select: {
              title: true,
              company: { select: { name: true } },
            },
          },
        },
      });

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            error: "Venue conflict detected",
            conflicts: conflicts.map((c) => ({
              id: c.id,
              title: c.title,
              venue: c.venue,
              startTime: c.startTime,
              endTime: c.endTime,
              drive: c.drive
                ? `${c.drive.company.name} - ${c.drive.title}`
                : null,
            })),
          },
          { status: 409 }
        );
      }
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        startTime,
        endTime,
        venue: data.venue,
        meetingLink: data.meetingLink || null,
        driveId: data.driveId || null,
      },
      include: {
        drive: {
          select: {
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, event },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
