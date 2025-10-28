import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
            lastLoginAt: true
          }
        },
        applications: {
          include: {
            drive: {
              include: {
                company: {
                  select: {
                    name: true,
                    logo: true
                  }
                }
              }
            }
          },
          orderBy: {
            appliedAt: "desc"
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const studentDetail = {
      id: student.id,
      rollNo: student.rollNo,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user.email,
      branch: student.branch,
      cgpa: student.cgpa,
      backlogs: student.backlogs,
      phone: student.phone,
      isActive: student.user.isActive,
      lastLoginAt: student.user.lastLoginAt,
      applications: student.applications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        drive: {
          id: app.drive.id,
          title: app.drive.title,
          role: app.drive.role,
          company: {
            name: app.drive.company.name,
            logo: app.drive.company.logo
          }
        }
      }))
    };

    return NextResponse.json({ student: studentDetail });
  } catch (error) {
    console.error("Error fetching student detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
