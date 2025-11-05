import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendApplicationStatusEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, remarks } = body;

    const application = await prisma.application.update({
      where: { id: params.id },
      data: {
        status,
        ...(remarks && { remarks }),
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        drive: {
          include: {
            company: true,
          },
        },
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: "Application Status Updated",
        message: `Your application for ${application.drive.company.name} - ${application.drive.role} has been updated to ${status}${remarks ? `. Remarks: ${remarks}` : ""}`,
        type: "APPLICATION_UPDATE",
        link: `/student/dashboard`,
      },
    });

    // Send email notification to student
    try {
      await sendApplicationStatusEmail({
        to: application.student.user.email,
        studentName: `${application.student.firstName} ${application.student.lastName}`,
        companyName: application.drive.company.name,
        role: application.drive.role,
        status,
        remarks: remarks || undefined,
      });
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the request if email fails
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email || "",
        action: "STATUS_CHANGED",
        target: "Application",
        targetId: application.id,
        meta: {
          oldStatus: application.status,
          newStatus: status,
          studentName: `${application.student.firstName} ${application.student.lastName}`,
          driveName: application.drive.title,
          remarks: remarks || null,
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.application.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
