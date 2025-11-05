import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/admin/events/[id] - Get single event
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
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
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["PPT", "TEST", "INTERVIEW", "OTHER"]).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  venue: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  driveId: z.string().optional().nullable(),
});

// PATCH /api/admin/events/[id] - Update event
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateEventSchema.parse(body);

    // Validate dates if provided
    const startTime = data.startTime
      ? new Date(data.startTime)
      : existingEvent.startTime;
    const endTime = data.endTime
      ? new Date(data.endTime)
      : existingEvent.endTime;

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check for conflicts (exclude current event)
    const venue = data.venue !== undefined ? data.venue : existingEvent.venue;
    if (venue) {
      const conflicts = await prisma.event.findMany({
        where: {
          id: { not: params.id },
          venue,
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
            })),
          },
          { status: 409 }
        );
      }
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.type && { type: data.type }),
        ...(data.startTime && { startTime }),
        ...(data.endTime && { endTime }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.meetingLink !== undefined && {
          meetingLink: data.meetingLink || null,
        }),
        ...(data.driveId !== undefined && { driveId: data.driveId }),
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

    return NextResponse.json({ success: true, event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
