import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const studentSchema = z.object({
  rollNo: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  branch: z.string().min(1),
  cgpa: z.number().min(0).max(10),
  backlogs: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { students } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];

      try {
        // Normalize field names (handle both camelCase and lowercase)
        const normalizedData = {
          rollNo: studentData.rollNo || studentData.rollno,
          firstName: studentData.firstName || studentData.firstname,
          lastName: studentData.lastName || studentData.lastname,
          email: studentData.email,
          branch: studentData.branch,
          cgpa: studentData.cgpa,
          backlogs: studentData.backlogs,
        };

        // Validate data
        const validated = studentSchema.parse({
          ...normalizedData,
          cgpa: parseFloat(normalizedData.cgpa),
          backlogs: normalizedData.backlogs
            ? parseInt(normalizedData.backlogs)
            : 0,
        });

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: validated.email },
        });

        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            email: validated.email,
            error: "Email already exists",
          });
          continue;
        }

        // Check if roll number already exists
        const existingStudent = await prisma.student.findUnique({
          where: { rollNo: validated.rollNo },
        });

        if (existingStudent) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            rollNo: validated.rollNo,
            error: "Roll number already exists",
          });
          continue;
        }

        // Generate invite token
        const inviteToken = crypto.randomBytes(32).toString("hex");

        // Create user and student
        await prisma.user.create({
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
                backlogs: validated.backlogs || 0,
              },
            },
          },
        });

        // TODO: Send invite email
        // await sendInviteEmail(validated.email, inviteToken);

        results.imported++;
      } catch (error) {
        results.failed++;
        let errorMessage = "Invalid data";

        if (error instanceof z.ZodError) {
          errorMessage = error.errors?.[0]?.message || error.message || "Validation failed";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        results.errors.push({
          row: i + 1,
          data: studentData,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        imported: results.imported,
        failed: results.failed,
        errors: results.errors,
        invitesSent: results.imported,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error importing students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
