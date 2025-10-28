import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAuditLog } from "@/lib/audit";

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
        { error: "Invalid students data" },
        { status: 400 }
      );
    }

    // Validate required fields
    for (const student of students) {
      if (!student.name || !student.email || !student.rollNumber || !student.branch) {
        return NextResponse.json(
          { error: "Missing required fields: name, email, rollNumber, branch" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate emails or roll numbers
    const emails = students.map(s => s.email);
    const rollNumbers = students.map(s => s.rollNumber);

    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: emails } },
          { student: { rollNo: { in: rollNumbers } } }
        ]
      },
      include: { student: true }
    });

    // Filter out duplicates
    const existingEmails = new Set(existingUsers.map(u => u.email));
    const existingRollNos = new Set(existingUsers.filter(u => u.student).map(u => u.student!.rollNo));

    const uniqueStudents = students.filter(s =>
      !existingEmails.has(s.email) && !existingRollNos.has(s.rollNumber)
    );

    const skippedCount = students.length - uniqueStudents.length;
    const skippedStudents = students.filter(s =>
      existingEmails.has(s.email) || existingRollNos.has(s.rollNumber)
    ).map(s => `${s.rollNumber} (${s.email})`);

    // Generate default password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Bulk create users and students (only unique ones)
    const createdStudents = await Promise.all(
      uniqueStudents.map(async (student) => {
        // Split name into firstName and lastName
        const nameParts = student.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        const user = await prisma.user.create({
          data: {
            email: student.email,
            password: hashedPassword,
            role: "STUDENT",
            isActive: true,
            student: {
              create: {
                rollNo: student.rollNumber,
                firstName: firstName,
                lastName: lastName,
                branch: student.branch,
                cgpa: parseFloat(student.cgpa) || 0.0,
                backlogs: parseInt(student.backlogs) || 0,
                phone: student.phone || null,
              }
            }
          },
          include: { student: true }
        });
        return user;
      })
    );

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email,
      action: "BULK_IMPORT",
      target: "Student",
      meta: {
        totalRecords: students.length,
        created: createdStudents.length,
        skipped: skippedCount,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      count: createdStudents.length,
      skipped: skippedCount,
      skippedStudents: skippedStudents,
      message: skippedCount > 0
        ? `Successfully created ${createdStudents.length} students. Skipped ${skippedCount} duplicate(s): ${skippedStudents.join(', ')}. Default password is 'password123'`
        : `Successfully created ${createdStudents.length} students. Default password is 'password123'`
    });
  } catch (error) {
    console.error("Error bulk uploading students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
