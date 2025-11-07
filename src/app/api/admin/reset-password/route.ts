import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();

    // Verify secret key
    if (secret !== "reset-admin-password-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Update admin user
    const admin = await prisma.user.update({
      where: { email: "admin@bmsce.ac.in" },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully",
      email: admin.email
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
