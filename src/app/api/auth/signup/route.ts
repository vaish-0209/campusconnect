import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  inviteToken: z.string().min(1, "Invite token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);

    // Find user by invite token
    const user = await prisma.user.findUnique({
      where: { inviteToken: validatedData.inviteToken },
      include: { student: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid invite token" },
        { status: 400 }
      );
    }

    if (user.isActive) {
      return NextResponse.json(
        { error: "Account already activated" },
        { status: 400 }
      );
    }

    // Check if invite token is expired (7 days)
    if (user.inviteSentAt) {
      const expiryDate = new Date(user.inviteSentAt);
      expiryDate.setDate(expiryDate.getDate() + 7);

      if (new Date() > expiryDate) {
        return NextResponse.json(
          { error: "Invite token has expired" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Update user and student
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true,
        inviteToken: null, // Clear token after use
        student: user.student
          ? {
              update: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
              },
            }
          : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account activated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
