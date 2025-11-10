import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
// @ts-ignore
import pdfParse from "pdf-parse";

// Initialize OpenAI (only if API key is available)
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text;

    console.log("📄 Extracted PDF text length:", extractedText.length);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The PDF might be image-based or empty." },
        { status: 400 }
      );
    }

    // Use OpenAI to extract structured data
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting placement drive information from job descriptions and company recruitment PDFs.

Extract the following information from the text and return it as valid JSON:

{
  "company": {
    "name": "Company name",
    "website": "Company website URL (if mentioned)",
    "description": "Brief company description",
    "industry": "Industry/sector"
  },
  "drive": {
    "title": "Job drive title (e.g., 'Software Engineer - Campus 2025')",
    "role": "Job role/position",
    "jobDescription": "Detailed job description",
    "ctc": "CTC in LPA (numeric value only, e.g., 12.5)",
    "ctcBreakup": "CTC breakup details if mentioned",
    "location": "Job location",
    "bond": "Bond period if mentioned (e.g., '2 years')",
    "techStack": ["Array of technologies/skills"],
    "minCgpa": "Minimum CGPA (numeric, e.g., 7.5)",
    "maxBacklogs": "Maximum backlogs allowed (numeric, e.g., 0)",
    "allowedBranches": ["Array of branch codes like CSE, IT, ECE, MECH, CIVIL, EEE"],
    "additionalCriteria": "Any other eligibility criteria"
  },
  "confidence": "high/medium/low - your confidence in the extraction"
}

IMPORTANT RULES:
1. If a field is not found, use empty string "" or empty array []
2. For branches, use standard codes: CSE, IT, ECE, MECH, CIVIL, EEE
3. Extract numeric values only for CTC, CGPA, backlogs
4. Be smart about inferring information (e.g., if it says "All branches", return all branch codes)
5. For CTC, convert to LPA if given in other formats
6. Return ONLY valid JSON, no markdown or extra text`,
        },
        {
          role: "user",
          content: `Extract placement drive information from this PDF text:\n\n${extractedText.slice(0, 10000)}`, // Limit to first 10k chars
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const extractedData = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    console.log("🤖 AI Extracted Data:", extractedData);

    // Clean and validate the extracted data
    const cleanedData = {
      company: {
        name: extractedData.company?.name || "",
        website: extractedData.company?.website || "",
        description: extractedData.company?.description || "",
        industry: extractedData.company?.industry || "",
      },
      drive: {
        title: extractedData.drive?.title || "",
        role: extractedData.drive?.role || "",
        jobDescription: extractedData.drive?.jobDescription || "",
        ctc: extractedData.drive?.ctc
          ? parseFloat(extractedData.drive.ctc.toString())
          : null,
        ctcBreakup: extractedData.drive?.ctcBreakup || "",
        location: extractedData.drive?.location || "",
        bond: extractedData.drive?.bond || "",
        techStack: Array.isArray(extractedData.drive?.techStack)
          ? extractedData.drive.techStack
          : [],
        minCgpa: extractedData.drive?.minCgpa
          ? parseFloat(extractedData.drive.minCgpa.toString())
          : null,
        maxBacklogs: extractedData.drive?.maxBacklogs
          ? parseInt(extractedData.drive.maxBacklogs.toString())
          : 0,
        allowedBranches: Array.isArray(extractedData.drive?.allowedBranches)
          ? extractedData.drive.allowedBranches
          : [],
        additionalCriteria: extractedData.drive?.additionalCriteria || "",
      },
      confidence: extractedData.confidence || "medium",
      rawText: extractedText.slice(0, 1000), // First 1000 chars for reference
    };

    return NextResponse.json({
      success: true,
      data: cleanedData,
      message: "PDF extracted successfully",
    });
  } catch (error: any) {
    console.error("Error extracting PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to extract PDF",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
