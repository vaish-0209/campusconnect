"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function AddStudentsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const downloadTemplate = () => {
    const headers = [
      "name",
      "email",
      "rollNumber",
      "branch",
      "cgpa",
      "backlogs",
      "phone"
    ];

    const sampleData = [
      "John Doe,john@example.com,CS001,Computer Science,8.5,0,9876543210",
      "Jane Smith,jane@example.com,CS002,Computer Science,9.2,0,9876543211"
    ];

    const csv = [headers.join(","), ...sampleData].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim());

      const students = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const student: any = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });
        return student;
      });

      // Convert numeric fields
      const processedStudents = students.map(s => ({
        name: s.name,
        email: s.email,
        rollNumber: s.rollNumber,
        branch: s.branch,
        cgpa: s.cgpa,
        backlogs: s.backlogs || "0",
        phone: s.phone
      }));

      const response = await fetch("/api/admin/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: processedStudents }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully uploaded ${data.count} students!`);
        setTimeout(() => router.push("/admin/students"), 2000);
      } else {
        setError(data.error || "Failed to upload students");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while uploading");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard">
                <h1 className="text-xl font-semibold text-foreground tracking-wide">
                  Campus<span className="text-primary">Connect</span>
                </h1>
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/admin/dashboard" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Dashboard
                </Link>
                <Link href="/admin/students" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
                  Students
                </Link>
                <Link href="/admin/companies" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Companies
                </Link>
                <Link href="/admin/drives" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Drives
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <Link href="/admin/students" className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm mb-4 inline-flex font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Link>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Bulk Upload Students
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload multiple students at once using a CSV file
          </p>
        </div>

        {/* Instructions */}
        <div className="glass-card border border-border/50 rounded-xl p-8 mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">How to upload:</h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold">1</span>
              <span>Download the CSV template below</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold">2</span>
              <span>Fill in student details (name, email, roll number, branch, CGPA, backlogs, phone)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold">3</span>
              <span>Upload the completed CSV file</span>
            </li>
          </ol>

          <button
            onClick={downloadTemplate}
            className="mt-6 px-6 py-3 gradient-primary text-white rounded-full hover:opacity-90 transition-all font-medium inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download CSV Template
          </button>
        </div>

        {/* Upload Section */}
        <div className="glass-card border border-border/50 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload CSV File
          </h3>

          <div className="space-y-6">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Select CSV File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:gradient-primary
                    file:text-white
                    hover:file:opacity-90
                    file:cursor-pointer cursor-pointer
                    bg-card border border-border/50 rounded-xl p-3"
                />
              </div>
              {file && (
                <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full px-6 py-4 gradient-primary text-white rounded-full hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {uploading ? "Uploading..." : "Upload Students"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
