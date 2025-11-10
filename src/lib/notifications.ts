import { prisma } from "./prisma";
import { sendEmail } from "./email";

interface NotificationData {
  title: string;
  message: string;
  type: string;
  link?: string;
}

/**
 * Send notification to a single user
 */
export async function sendNotificationToUser(
  userId: string,
  data: NotificationData,
  sendEmailNotification = true
) {
  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
      },
    });

    // Send email if requested
    if (sendEmailNotification) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          student: { select: { firstName: true } }
        },
      });

      if (user) {
        await sendEmail({
          to: user.email,
          subject: data.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8b5cf6;">${data.title}</h2>
              <p>${data.message}</p>
              ${data.link ? `<a href="${process.env.NEXTAUTH_URL}${data.link}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Details</a>` : ''}
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">This is an automated notification from CampusConnect Placement Portal.</p>
            </div>
          `,
        }).catch((err) => {
          console.error("Failed to send email notification:", err);
        });
      }
    }

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToMultipleUsers(
  userIds: string[],
  data: NotificationData,
  sendEmailNotification = true
) {
  try {
    // Create in-app notifications
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
      })),
    });

    // Send emails if requested
    if (sendEmailNotification) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          email: true,
          student: { select: { firstName: true } }
        },
      });

      // Send emails in background (don't await)
      Promise.all(
        users.map((user) =>
          sendEmail({
            to: user.email,
            subject: data.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8b5cf6;">${data.title}</h2>
                <p>Hi ${user.student?.firstName || 'Student'},</p>
                <p>${data.message}</p>
                ${data.link ? `<a href="${process.env.NEXTAUTH_URL}${data.link}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Details</a>` : ''}
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">This is an automated notification from CampusConnect Placement Portal.</p>
              </div>
            `,
          }).catch((err) => {
            console.error(`Failed to send email to ${user.email}:`, err);
          })
        )
      ).catch((err) => {
        console.error("Some emails failed to send:", err);
      });
    }

    return { count: userIds.length };
  } catch (error) {
    console.error("Failed to send bulk notifications:", error);
    throw error;
  }
}

/**
 * Notify students about new drive
 */
export async function notifyNewDrive(driveId: string) {
  try {
    const drive = await prisma.drive.findUnique({
      where: { id: driveId },
      include: { company: true },
    });

    if (!drive) return;

    // Find eligible students based on drive criteria
    const eligibleStudents = await prisma.student.findMany({
      where: {
        ...(drive.allowedBranches && {
          branch: { in: drive.allowedBranches.split(",").map((b) => b.trim()) },
        }),
        cgpa: { gte: drive.minCgpa || 0 },
        backlogs: { lte: drive.maxBacklogs || 999 },
        user: { isActive: true },
      },
      select: { userId: true },
    });

    const userIds = eligibleStudents.map((s) => s.userId);

    if (userIds.length === 0) return;

    await sendNotificationToMultipleUsers(
      userIds,
      {
        title: `New Drive: ${drive.company.name}`,
        message: `${drive.company.name} is hiring for ${drive.role}! Package: ₹${drive.ctc}L. Register before ${new Date(drive.registrationEnd).toLocaleDateString()}.`,
        type: "DRIVE",
        link: `/student/drives/${drive.id}`,
      },
      true
    );

    console.log(`✅ Notified ${userIds.length} students about new drive: ${drive.company.name}`);
  } catch (error) {
    console.error("Failed to notify about new drive:", error);
  }
}

/**
 * Notify student about application status change
 */
export async function notifyApplicationStatusChange(
  applicationId: string,
  oldStatus: string,
  newStatus: string
) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { select: { userId: true } },
        drive: { include: { company: true } },
      },
    });

    if (!application) return;

    const statusMessages: Record<string, string> = {
      SHORTLISTED: `Congratulations! You've been shortlisted for ${application.drive.role} at ${application.drive.company.name}.`,
      TEST_CLEARED: `Great news! You've cleared the test for ${application.drive.role} at ${application.drive.company.name}.`,
      INTERVIEW_CLEARED: `Excellent! You've cleared the interview for ${application.drive.role} at ${application.drive.company.name}.`,
      OFFER: `🎉 Congratulations! You've received an offer from ${application.drive.company.name} for ${application.drive.role}!`,
      REJECTED: `Unfortunately, you were not selected for ${application.drive.role} at ${application.drive.company.name}. Keep applying!`,
      ON_HOLD: `Your application for ${application.drive.role} at ${application.drive.company.name} is on hold.`,
    };

    const message = statusMessages[newStatus] || `Your application status has been updated to ${newStatus}.`;

    await sendNotificationToUser(
      application.student.userId,
      {
        title: `Application Update: ${application.drive.company.name}`,
        message,
        type: "APPLICATION",
        link: `/student/applications`,
      },
      true
    );

    console.log(`✅ Notified student about status change: ${oldStatus} → ${newStatus}`);
  } catch (error) {
    console.error("Failed to notify about status change:", error);
  }
}
