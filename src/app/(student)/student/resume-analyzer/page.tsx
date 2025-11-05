"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  CheckCircle,
  Target,
  Award,
  ArrowLeft,
  Briefcase,
  Upload,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";
import type { ResumeAnalysis } from "@/lib/resumeAnalyzer";
import { StudentNavbar } from "@/components/student/StudentNavbar";

const ROLE_OPTIONS = [
  { id: "software-engineer", name: "Software Engineer / Developer" },
  { id: "frontend-developer", name: "Frontend Developer" },
  { id: "backend-developer", name: "Backend Developer" },
  { id: "data-scientist", name: "Data Scientist / ML Engineer" },
  { id: "ai-ml-engineer", name: "AI/ML Engineer (Advanced)" },
  { id: "devops-engineer", name: "DevOps / SRE Engineer" },
  { id: "data-engineer", name: "Data Engineer" },
  { id: "product-manager", name: "Product Manager / APM" },
  { id: "cybersecurity", name: "Cybersecurity Engineer" },
  { id: "hardware-engineer", name: "Hardware Engineer" },
];

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [jdMatch, setJdMatch] = useState<any>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large. Maximum 5MB allowed.");
      return;
    }

    setUploading(true);
    setUploadedFile(file);
    setShowTextEditor(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/student/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResumeText(data.resumeText);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to extract text from resume");
        setUploadedFile(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during file upload");
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setResumeText("");
    setShowTextEditor(false);
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert("Please upload a resume or paste resume text");
      return;
    }

    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch("/api/student/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText,
          jobDescription: jobDescription.trim() || undefined,
          roleId: selectedRole,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setJdMatch(data.jdMatch);
      } else {
        alert("Failed to analyze resume");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("An error occurred during analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  const clearAll = () => {
    setResumeText("");
    setUploadedFile(null);
    setJobDescription("");
    setSelectedRole("");
    setAnalysis(null);
    setJdMatch(null);
    setShowTextEditor(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />

      <main className="container px-4 py-6 mx-auto max-w-6xl">
        {/* Input Section - Compact Layout */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Upload Resume */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Upload Resume <span className="text-red-400">*</span>
              </label>
              {!uploadedFile ? (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-background hover:bg-secondary/20 transition-all">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground text-center px-2">
                    PDF or DOCX (Max 5MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1 hover:bg-background rounded transition-colors ml-2"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowTextEditor(!showTextEditor)}
                    className="text-xs text-primary hover:underline"
                  >
                    {showTextEditor ? "Hide" : "View/Edit"} extracted text
                  </button>
                </div>
              )}
              {uploading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Extracting...
                </div>
              )}
              {!uploadedFile && (
                <button
                  onClick={() => setShowTextEditor(true)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Or paste text manually
                </button>
              )}
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Target Role <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-28 p-3 bg-background border-2 border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">Select role...</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Description (Optional) */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Job Description <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste JD for custom matching..."
                className="w-full h-28 p-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-xs"
              />
            </div>
          </div>

          {/* Text Editor (Collapsible) */}
          {showTextEditor && (
            <div className="mb-4 p-4 bg-secondary/20 border border-border rounded-lg">
              <label className="block text-sm font-semibold mb-2">Resume Text</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-48 p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-xs font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {resumeText.length} characters
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={analyzeResume}
              disabled={analyzing || !resumeText.trim() || !selectedRole}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-all"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Role Match Score - Large and Prominent */}
            {analysis.roleMatch && (
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Briefcase className="w-7 h-7 text-primary" />
                    {analysis.roleMatch.roleName}
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Match Score</p>
                    <p className={`text-5xl font-bold ${getScoreColor(analysis.roleMatch.score)}`}>
                      {analysis.roleMatch.score}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched Skills */}
                  {analysis.roleMatch.matchedSkills.length > 0 && (
                    <div className="bg-background/50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        You Have ({analysis.roleMatch.matchedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.roleMatch.matchedSkills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {analysis.roleMatch.missingSkills.length > 0 && (
                    <div className="bg-background/50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Consider Adding ({analysis.roleMatch.missingSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.roleMatch.missingSkills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs text-orange-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* JD Match (if provided) */}
            {jdMatch && (
              <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-400" />
                  Job Description Match
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-background/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Overall Match</p>
                    <p className={`text-4xl font-bold ${getScoreColor(jdMatch.overallMatch)}`}>
                      {jdMatch.overallMatch}%
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">ATS Score</p>
                    <p className={`text-4xl font-bold ${getScoreColor(jdMatch.atsScore)}`}>
                      {jdMatch.atsScore}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jdMatch.matchedSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-400 mb-2">
                        ✅ JD Skills You Have
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {jdMatch.matchedSkills.slice(0, 20).map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {jdMatch.missingSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-2">
                        ❌ Missing from JD
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {jdMatch.missingSkills.slice(0, 20).map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-5">
                  <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-green-300 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {analysis.improvements.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-5">
                  <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Suggested Improvements
                  </h3>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-orange-300 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">→</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Sparkles className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Ready to Analyze Your Resume</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Upload your resume (PDF/DOCX), select your target role, and click Analyze to get instant AI-powered feedback
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
