import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendApplicationStatusEmail } from "@/lib/email";

const VALID_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "TEST_CLEARED",
  "INTERVIEW_CLEARED",
  "OFFER",
  "REJECTED",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      return NextResponse.json({ error: "Empty CSV file" }, { status: 400 });
    }

    // Parse header
    const header = lines[0].split(",").map((h) => h.trim());
    if (!header.includes("rollNo") || !header.includes("status")) {
      return NextResponse.json(
        { error: "CSV must contain 'rollNo' and 'status' columns" },
        { status: 400 }
      );
    }

    const rollNoIndex = header.indexOf("rollNo");
    const statusIndex = header.indexOf("status");
    const remarksIndex = header.indexOf("remarks");

    let successCount = 0;
    const errors: string[] = [];

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());
      const rollNo = values[rollNoIndex];
      const status = values[statusIndex];
      const remarks = remarksIndex >= 0 ? values[remarksIndex] : null;

      try {
        // Validate status
        if (!VALID_STATUSES.includes(status)) {
          errors.push(`Row ${i + 1}: Invalid status '${status}'`);
          continue;
        }

        // Find student
        const student = await prisma.student.findUnique({
          where: { rollNo },
          include: { user: true },
        });

        if (!student) {
          errors.push(`Row ${i + 1}: Student with roll number '${rollNo}' not found`);
          continue;
        }

        // Find latest application for this student
        const application = await prisma.application.findFirst({
          where: { studentId: student.id },
          include: {
            drive: {
              include: { company: true },
            },
          },
          orderBy: { appliedAt: "desc" },
        });

        if (!application) {
          errors.push(`Row ${i + 1}: No applications found for student '${rollNo}'`);
          continue;
        }

        // Update application status
        await prisma.application.update({
          where: { id: application.id },
          data: {
            status,
            ...(remarks && { remarks }),
          },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: student.userId,
            title: "Application Status Updated",
            message: `Your application for ${application.drive.company.name} - ${application.drive.role} has been updated to ${status}${remarks ? `. Remarks: ${remarks}` : ""}`,
            type: "APPLICATION_UPDATE",
            link: `/student/applications`,
          },
        });

        // Send email notification
        try {
          await sendApplicationStatusEmail({
            to: student.user.email,
            studentName: `${student.firstName} ${student.lastName}`,
            companyName: application.drive.company.name,
            role: application.drive.role,
            status,
            remarks: remarks || undefined,
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: Failed to update - ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Error processing bulk update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
