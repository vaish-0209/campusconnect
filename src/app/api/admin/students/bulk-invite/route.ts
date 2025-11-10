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

    // Pre-check for duplicates
    const emailsToCheck = students.map(s => s.email || s.Email).filter(Boolean);
    const rollNosToCheck = students.map(s => s.rollNo || s.rollno).filter(Boolean);

    const existingUsers = await prisma.user.findMany({
      where: {
        email: { in: emailsToCheck }
      },
      select: { email: true }
    });

    const existingStudents = await prisma.student.findMany({
      where: {
        rollNo: { in: rollNosToCheck }
      },
      select: { rollNo: true }
    });

    const duplicateEmails = new Set(existingUsers.map(u => u.email));
    const duplicateRollNos = new Set(existingStudents.map(s => s.rollNo));

    const duplicates: any[] = [];
    const validStudents: any[] = [];

    // Separate duplicates from valid students
    students.forEach((student, index) => {
      const email = student.email || student.Email;
      const rollNo = student.rollNo || student.rollno;

      if (duplicateEmails.has(email) || duplicateRollNos.has(rollNo)) {
        duplicates.push({
          row: index + 1,
          rollNo,
          email,
          reason: duplicateEmails.has(email) ? 'Email already exists' : 'Roll number already exists'
        });
      } else {
        validStudents.push({ ...student, _rowIndex: index });
      }
    });

    const results = {
      imported: 0,
      failed: 0,
      skipped: duplicates.length,
      errors: [] as any[],
      duplicates: duplicates,
    };

    // Import only valid students
    for (let i = 0; i < validStudents.length; i++) {
      const studentData = validStudents[i];
      const rowIndex = studentData._rowIndex + 1;

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
          errorMessage = (error as any).errors?.[0]?.message || error.message || "Validation failed";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        results.errors.push({
          row: rowIndex,
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
        skipped: results.skipped,
        errors: results.errors,
        duplicates: results.duplicates,
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
