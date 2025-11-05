import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/resumeAnalyzer";
import { analyzeJobDescription, matchResumeWithJD } from "@/lib/jdAnalyzer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeText, driveId, jobDescription, roleId } = body;

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    // Get student data
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get job requirements if driveId is provided
    let jobRequirements;
    if (driveId) {
      const drive = await prisma.drive.findUnique({
        where: { id: driveId },
        include: { company: true },
      });

      if (drive) {
        jobRequirements = {
          requiredSkills: drive.techStack
            ? drive.techStack.split(",").map((s) => s.trim())
            : [],
          preferredSkills: [],
          minCGPA: drive.minCgpa || undefined,
          description: drive.jobDescription,
        };
      }
    }

    // DEBUG: Log extracted text preview
    console.log("=== RESUME TEXT PREVIEW ===");
    console.log("Length:", resumeText.length);
    console.log("First 500 chars:", resumeText.substring(0, 500));
    console.log("===========================");

    // Analyze resume (with optional role)
    const analysis = analyzeResume(
      resumeText,
      {
        cgpa: student.cgpa,
        branch: student.branch,
        skills: student.skills || undefined,
      },
      jobRequirements,
      roleId
    );

    // NEW: JD-based analysis if JD provided
    let jdMatch;
    if (jobDescription) {
      const jdAnalysis = analyzeJobDescription(jobDescription);
      jdMatch = matchResumeWithJD(resumeText, jdAnalysis);
    }

    return NextResponse.json({
      analysis,
      jdMatch, // JD match results
      debug: {
        extractedTextLength: resumeText.length,
        extractedTextPreview: resumeText.substring(0, 300)
      }
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
