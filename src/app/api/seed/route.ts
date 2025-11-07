import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Temporary endpoint to seed production database
// DELETE THIS FILE after seeding!
export async function POST(req: Request) {
  try {
    // Security check - only allow in production and with secret header
    const authHeader = req.headers.get("x-seed-secret");
    const expectedSecret = process.env.SEED_SECRET || "change-me-to-something-secure";

    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@bmsce.ac.in" },
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Database already seeded",
        admin: "admin@bmsce.ac.in already exists"
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: "admin@bmsce.ac.in",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      credentials: {
        email: "admin@bmsce.ac.in",
        password: "admin123"
      }
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error.message },
      { status: 500 }
    );
  }
}
