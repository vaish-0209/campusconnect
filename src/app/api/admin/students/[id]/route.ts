import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  backlogs: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Check if student exists
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

    // Update student backlogs if provided
    if (data.backlogs !== undefined) {
      await prisma.student.update({
        where: { id: studentId },
        data: { backlogs: data.backlogs },
      });
    }

    // Update user active status if provided
    if (data.isActive !== undefined) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { isActive: data.isActive },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Delete the user (will cascade delete student and applications)
    await prisma.user.delete({
      where: { id: student.userId }
    });

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
