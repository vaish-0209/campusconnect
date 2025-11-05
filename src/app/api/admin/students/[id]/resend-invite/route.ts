import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Generate new invite token
    const inviteToken = crypto.randomBytes(32).toString("hex");

    // Update user with new token
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        inviteToken,
        inviteSentAt: new Date(),
      },
    });

    // TODO: Send invite email
    // await sendInviteEmail(student.user.email, inviteToken);

    // For now, return the setup URL (in production, this would be sent via email)
    const setupUrl = `${process.env.NEXTAUTH_URL}/setup-password?token=${inviteToken}`;

    return NextResponse.json({
      success: true,
      message: "Invite email sent successfully",
      // Remove setupUrl in production when email is implemented
      setupUrl,
    });
  } catch (error) {
    console.error("Error resending invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
