import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractResumeText } from "@/lib/resumeAnalyzer";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student record
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { student: true },
    });

    if (!user || !user.student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOCX files are allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from file
    const resumeText = await extractResumeText(buffer, file.type);

    // Convert buffer to base64 for storage (temporary solution - use cloud storage in production)
    const base64File = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64File}`;

    // Generate unique public ID
    const publicId = crypto.randomBytes(16).toString("hex");

    // Delete old resume if exists
    await prisma.document.deleteMany({
      where: {
        studentId: user.student.id,
        type: "RESUME",
      },
    });

    // Save new resume to database
    const document = await prisma.document.create({
      data: {
        studentId: user.student.id,
        type: "RESUME",
        name: file.name,
        url: dataUrl, // In production, this would be a cloud storage URL
        publicId,
        size: file.size,
      },
    });

    return NextResponse.json({
      resumeText,
      document: {
        id: document.id,
        name: document.name,
        url: document.url,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process resume" },
      { status: 500 }
    );
  }
}
