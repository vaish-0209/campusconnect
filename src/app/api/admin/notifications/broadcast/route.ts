import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendBulkNotificationEmails } from "@/lib/email";

const broadcastSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.string().default("ANNOUNCEMENT"),
  target: z.enum(["all", "branch", "drive"]),
  targetValue: z.string().optional(), // Branch name or Drive ID
  link: z.string().optional(),
  sendEmail: z.boolean().default(false),
});

// POST /api/admin/notifications/broadcast - Send notification to multiple users
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = broadcastSchema.parse(body);

    let targetUserIds: string[] = [];

    // Determine target users based on target type
    switch (data.target) {
      case "all":
        // All active students
        const allUsers = await prisma.user.findMany({
          where: {
            role: "STUDENT",
            isActive: true,
          },
          select: { id: true },
        });
        targetUserIds = allUsers.map((u) => u.id);
        break;

      case "branch":
        if (!data.targetValue) {
          return NextResponse.json(
            { error: "Branch name is required for branch target" },
            { status: 400 }
          );
        }
        // Students in specific branch
        const branchStudents = await prisma.student.findMany({
          where: {
            branch: data.targetValue,
            user: { isActive: true },
          },
          select: { userId: true },
        });
        targetUserIds = branchStudents.map((s) => s.userId);
        break;

      case "drive":
        if (!data.targetValue) {
          return NextResponse.json(
            { error: "Drive ID is required for drive target" },
            { status: 400 }
          );
        }
        // Students who applied to specific drive
        const driveApplications = await prisma.application.findMany({
          where: { driveId: data.targetValue },
          include: {
            student: {
              select: {
                userId: true,
                user: { select: { isActive: true } },
              },
            },
          },
        });
        targetUserIds = driveApplications
          .filter((app) => app.student.user.isActive)
          .map((app) => app.student.userId);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid target type" },
          { status: 400 }
        );
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: "No users found matching the target criteria" },
        { status: 400 }
      );
    }

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map((userId) => ({
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
      })),
    });

    // Send emails if requested
    let emailResults = null;
    if (data.sendEmail) {
      // Fetch user emails
      const users = await prisma.user.findMany({
        where: { id: { in: targetUserIds } },
        select: { email: true, student: { select: { firstName: true } } },
      });

      // Send bulk emails
      emailResults = await sendBulkNotificationEmails({
        recipients: users.map((u) => ({
          email: u.email,
          name: u.student?.firstName || "Student",
        })),
        subject: data.title,
        message: data.message,
        link: data.link,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Notification sent to ${targetUserIds.length} users`,
        count: notifications.count,
        emailsSent: emailResults?.sent || 0,
        emailsFailed: emailResults?.failed || 0,
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

    console.error("Error broadcasting notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
