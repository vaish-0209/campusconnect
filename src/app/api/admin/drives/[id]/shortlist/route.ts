import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { updates, notifyStudents = true } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const results = {
      updated: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const update of updates) {
      try {
        const { rollNo, status, remarks } = update;

        // Find student by roll number
        const student = await prisma.student.findUnique({
          where: { rollNo },
        });

        if (!student) {
          results.failed++;
          results.errors.push({
            rollNo,
            error: "Student not found",
          });
          continue;
        }

        // Find application
        const application = await prisma.application.findUnique({
          where: {
            studentId_driveId: {
              studentId: student.id,
              driveId: params.id,
            },
          },
        });

        if (!application) {
          results.failed++;
          results.errors.push({
            rollNo,
            error: "Student did not apply to this drive",
          });
          continue;
        }

        // Validate status
        if (!Object.values(ApplicationStatus).includes(status)) {
          results.failed++;
          results.errors.push({
            rollNo,
            error: `Invalid status: ${status}`,
          });
          continue;
        }

        // Update application
        await prisma.application.update({
          where: { id: application.id },
          data: {
            status,
            ...(remarks && { remarks }),
          },
        });

        // TODO: Create notification if notifyStudents is true

        results.updated++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          rollNo: update.rollNo,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email || "",
      action: "SHORTLIST_UPLOAD",
      target: "Drive",
      targetId: params.id,
      meta: {
        updated: results.updated,
        failed: results.failed,
        totalRecords: updates.length,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      updated: results.updated,
      failed: results.failed,
      errors: results.errors,
      notificationsSent: notifyStudents ? results.updated : 0,
    });
  } catch (error) {
    console.error("Error processing shortlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
