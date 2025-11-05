import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const studentSchema = z.object({
  rollNo: z.string().min(1, "Roll number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  branch: z.string().min(1, "Branch is required"),
  cgpa: z.number().min(0).max(10, "CGPA must be between 0 and 10"),
  backlogs: z.number().min(0).default(0),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = studentSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Check if roll number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNo: validated.rollNo },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "A student with this roll number already exists" },
        { status: 409 }
      );
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString("hex");

    // Create user and student
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        role: "STUDENT",
        isActive: false,
        inviteToken,
        inviteSentAt: new Date(),
        student: {
          create: {
            rollNo: validated.rollNo,
            firstName: validated.firstName,
            lastName: validated.lastName,
            branch: validated.branch,
            cgpa: validated.cgpa,
            backlogs: validated.backlogs,
            phone: validated.phone || null,
          },
        },
      },
      include: {
        student: true,
      },
    });

    // TODO: Send invite email
    // await sendInviteEmail(validated.email, inviteToken);

    return NextResponse.json(
      {
        success: true,
        message: "Student added successfully",
        student: {
          id: user.student?.id,
          rollNo: user.student?.rollNo,
          name: `${user.student?.firstName} ${user.student?.lastName}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error adding student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
