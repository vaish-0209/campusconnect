import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { createAuditLog } from "@/lib/audit";
import { sendPasswordResetEmail } from "@/lib/email";
import { passwordResetLimiter, getClientIp } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// POST /api/auth/forgot-password - Request password reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Rate limiting (3 requests per hour per email)
    const clientIp = getClientIp(req);
    const rateLimitResult = await passwordResetLimiter(req, `${email}-${clientIp}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many password reset attempts. Please try again later.",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
            "Retry-After": rateLimitResult.retryAfter?.toString() || "3600",
          },
        }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset link has been sent",
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    // Get user name from student profile if available
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { firstName: true },
    });

    // Send password reset email
    await sendPasswordResetEmail({
      to: email,
      resetLink,
      userName: student?.firstName || "User",
    });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      userEmail: email,
      action: "PASSWORD_RESET",
      target: "User",
      targetId: user.id,
      meta: { tokenExpiry: resetTokenExpiry },
      req,
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email format", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
