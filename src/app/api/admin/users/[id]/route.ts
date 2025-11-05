import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createAuditLog } from "@/lib/audit";

// GET /api/admin/users/[id] - Get single admin user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow viewing admin-type users
    if (user.role === "STUDENT") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional(),
  role: z.enum(["ADMIN", "RECRUITER"]).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/users/[id] - Update admin user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent modifying student accounts through this endpoint
    if (existingUser.role === "STUDENT") {
      return NextResponse.json(
        { error: "Cannot modify student accounts through this endpoint" },
        { status: 403 }
      );
    }

    // Prevent self-deactivation
    if (
      params.id === session.user.id &&
      req.json !== undefined
    ) {
      const body = await req.json();
      if (body.isActive === false) {
        return NextResponse.json(
          { error: "Cannot deactivate your own account" },
          { status: 400 }
        );
      }
    }

    const body = await req.json();
    const data = updateUserSchema.parse(body);

    // Check email uniqueness if being updated
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    const updateData: any = {
      ...(data.email && { email: data.email.toLowerCase() }),
      ...(data.role && { role: data.role }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email || "",
      action: "UPDATE",
      target: "User",
      targetId: params.id,
      meta: {
        updatedFields: Object.keys(data),
        targetUserEmail: user.email,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete admin user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent self-deletion
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow deleting admin-type users
    if (user.role === "STUDENT") {
      return NextResponse.json(
        { error: "Cannot delete student accounts through this endpoint" },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email || "",
      action: "DELETE",
      target: "User",
      targetId: params.id,
      meta: {
        deletedUserEmail: user.email,
        deletedUserRole: user.role,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
