import { Resend } from "resend";
import { PasswordResetEmail } from "@/emails/password-reset";
import { render } from "@react-email/render";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "College Placement <noreply@placement.edu>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Generic email sender
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log("\n========================================");
    console.log("📧 EMAIL SIMULATION (RESEND_API_KEY not configured)");
    console.log("========================================");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("----------------------------------------");
    console.log("HTML Preview (first 500 chars):");
    console.log(html.substring(0, 500) + "...");
    console.log("========================================\n");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  to,
  resetLink,
  userName,
}: {
  to: string;
  resetLink: string;
  userName: string;
}) {
  const html = render(PasswordResetEmail({ userName, resetLink }));

  return sendEmail({
    to,
    subject: "Reset Your Password - College Placement Portal",
    html,
  });
}

/**
 * Send bulk notification emails
 */
export async function sendBulkNotificationEmails({
  recipients,
  subject,
  message,
  link,
}: {
  recipients: Array<{ email: string; name: string }>;
  subject: string;
  message: string;
  link?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      `RESEND_API_KEY not configured. Would send ${recipients.length} emails`
    );
    return { success: false, sent: 0, failed: recipients.length };
  }

  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Send in batches to avoid rate limits (Resend free tier: 100/day)
  const BATCH_SIZE = 10;
  const batches = [];
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const promises = batch.map(async (recipient) => {
      const html = generateNotificationEmail({
        name: recipient.name,
        subject,
        message,
        link,
      });

      const result = await sendEmail({
        to: recipient.email,
        subject,
        html,
      });

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`${recipient.email}: ${result.error}`);
      }
    });

    await Promise.all(promises);

    // Rate limiting delay (1 second between batches)
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Send student invite email
 */
export async function sendStudentInviteEmail({
  to,
  inviteLink,
  studentName,
  rollNo,
}: {
  to: string;
  inviteLink: string;
  studentName: string;
  rollNo: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to College Placement Portal</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName},</p>
            <p>Your account has been created for the College Placement Portal.</p>
            <p><strong>Roll Number:</strong> ${rollNo}</p>
            <p>Click the button below to set your password and activate your account:</p>
            <a href="${inviteLink}" class="button">Activate Account</a>
            <p>This link will expire in 7 days.</p>
            <p>If you didn't expect this email, please contact your placement coordinator.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} College Placement Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Activate Your Placement Portal Account",
    html,
  });
}

/**
 * Send drive announcement email
 */
export async function sendDriveAnnouncementEmail({
  to,
  studentName,
  companyName,
  driveTitle,
  deadline,
  driveLink,
}: {
  to: string;
  studentName: string;
  companyName: string;
  driveTitle: string;
  deadline: Date;
  driveLink: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Placement Drive</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName},</p>
            <p>A new placement drive has been opened and you are eligible to apply!</p>
            <h2>${companyName} - ${driveTitle}</h2>
            <div class="highlight">
              <strong>⏰ Application Deadline:</strong> ${deadline.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
            <a href="${driveLink}" class="button">View Details & Apply</a>
            <p>Don't miss this opportunity! Make sure to apply before the deadline.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} College Placement Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `New Drive: ${companyName} - ${driveTitle}`,
    html,
  });
}

/**
 * Send application status update email
 */
export async function sendApplicationStatusEmail({
  to,
  studentName,
  companyName,
  role,
  status,
  remarks,
}: {
  to: string;
  studentName: string;
  companyName: string;
  role: string;
  status: string;
  remarks?: string;
}) {
  const statusColors: Record<string, string> = {
    APPLIED: "#3b82f6",
    SHORTLISTED: "#8b5cf6",
    TEST_CLEARED: "#06b6d4",
    INTERVIEW_CLEARED: "#10b981",
    OFFER: "#059669",
    REJECTED: "#ef4444",
  };

  const statusEmojis: Record<string, string> = {
    APPLIED: "📝",
    SHORTLISTED: "✨",
    TEST_CLEARED: "✅",
    INTERVIEW_CLEARED: "🎯",
    OFFER: "🎉",
    REJECTED: "❌",
  };

  const statusColor = statusColors[status] || "#2563eb";
  const statusEmoji = statusEmojis[status] || "📢";
  const formattedStatus = status.replace(/_/g, " ");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .status-box { background: white; padding: 20px; border-left: 4px solid ${statusColor}; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: ${statusColor}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusEmoji} Application Status Updated</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName},</p>
            <p>Great news! Your application status has been updated.</p>
            <div class="status-box">
              <h2>${companyName}</h2>
              <p><strong>Role:</strong> ${role}</p>
              <p><strong>New Status:</strong> ${formattedStatus}</p>
              ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
            </div>
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/student/dashboard" class="button">View Dashboard</a>
            ${status === "OFFER" ? "<p>🎊 Congratulations on your offer! The placement team will contact you with further details.</p>" : ""}
            ${status === "TEST_CLEARED" || status === "INTERVIEW_CLEARED" ? "<p>Keep up the great work! Stay tuned for updates on the next round.</p>" : ""}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} College Placement Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Application Update: ${companyName} - ${formattedStatus}`,
    html,
  });
}

/**
 * Send event reminder email
 */
export async function sendEventReminderEmail({
  to,
  studentName,
  eventTitle,
  eventType,
  eventTime,
  venue,
  meetingLink,
}: {
  to: string;
  studentName: string;
  eventTitle: string;
  eventType: string;
  eventTime: Date;
  venue?: string;
  meetingLink?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border: 1px solid #e5e7eb; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Event Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName},</p>
            <p>This is a reminder for your upcoming event:</p>
            <div class="info-box">
              <h2>${eventTitle}</h2>
              <p><strong>Type:</strong> ${eventType}</p>
              <p><strong>Time:</strong> ${eventTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
              ${venue ? `<p><strong>Venue:</strong> ${venue}</p>` : ""}
              ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
            </div>
            ${meetingLink ? `<a href="${meetingLink}" class="button">Join Meeting</a>` : ""}
            <p>Make sure to be on time. Good luck!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} College Placement Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Reminder: ${eventTitle} - ${eventType}`,
    html,
  });
}

/**
 * Generate notification email HTML
 */
function generateNotificationEmail({
  name,
  subject,
  message,
  link,
}: {
  name: string;
  subject: string;
  message: string;
  link?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .message { background: white; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 ${subject}</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <div class="message">
              ${message.split("\n").map((line) => `<p>${line}</p>`).join("")}
            </div>
            ${link ? `<a href="${link}" class="button">View Details</a>` : ""}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} College Placement Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
