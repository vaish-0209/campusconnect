"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Upload, Download, FileText, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export default function ImportStudentsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim());

    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const student: any = {};

      headers.forEach((header, index) => {
        student[header] = values[index];
      });

      students.push(student);
    }

    return students;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const students = parseCSV(text);

      const response = await fetch("/api/admin/students/bulk-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        if (data.failed === 0) {
          setTimeout(() => router.push("/admin/students"), 2000);
        }
      } else {
        alert(data.error || "Failed to import students");
      }
    } catch (error) {
      console.error("Error importing:", error);
      alert("An error occurred during import");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `rollNo,firstName,lastName,email,branch,cgpa,backlogs
1BM20CS001,John,Doe,john@student.bmsce.ac.in,CSE,8.5,0
1BM20CS002,Jane,Smith,jane@student.bmsce.ac.in,CSE,9.0,0
1BM20IT001,Bob,Johnson,bob@student.bmsce.ac.in,IT,7.8,1`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/admin/students" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Students</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Import Students
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload a CSV file to bulk import student data
          </p>
        </div>

        {/* Instructions */}
        <div className="glass-card border border-primary/20 rounded-xl p-6 mb-6 bg-primary/5">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Download the CSV template by clicking the button below</li>
            <li>Fill in student details (roll no, name, email, branch, CGPA)</li>
            <li>Save the file as CSV format</li>
            <li>Upload the completed CSV file</li>
            <li>Students will receive invite emails to activate their accounts</li>
          </ol>
        </div>

        {/* Template Download */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">1. Download Template</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download the CSV template with required columns and example data
          </p>
          <button
            onClick={downloadTemplate}
            className="px-6 py-3 bg-card border border-border/50 text-foreground rounded-lg hover:border-primary/30 transition-all font-medium flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download CSV Template
          </button>
        </div>

        {/* CSV Format Info */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">CSV Format</h3>
          <div className="bg-card/50 p-4 rounded-lg border border-border/50 font-mono text-sm overflow-x-auto">
            <div className="text-muted-foreground">
              rollNo,firstName,lastName,email,branch,cgpa,backlogs
            </div>
            <div className="text-foreground">
              1BM20CS001,John,Doe,john@student.bmsce.ac.in,CSE,8.5,0
            </div>
            <div className="text-foreground">
              1BM20CS002,Jane,Smith,jane@student.bmsce.ac.in,CSE,9.0,0
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Required columns:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code className="text-primary">rollNo</code> - Student roll number (unique)</li>
              <li><code className="text-primary">firstName</code> - Student's first name</li>
              <li><code className="text-primary">lastName</code> - Student's last name</li>
              <li><code className="text-primary">email</code> - Valid email address (unique)</li>
              <li><code className="text-primary">branch</code> - CSE, IT, ECE, MECH, etc.</li>
              <li><code className="text-primary">cgpa</code> - Number between 0 and 10</li>
              <li><code className="text-primary">backlogs</code> - Number (optional, default 0)</li>
            </ul>
          </div>
        </div>

        {/* Upload Form */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">2. Upload CSV File</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:gradient-primary file:text-white
                    hover:file:opacity-90 file:cursor-pointer
                    cursor-pointer"
                />
              </div>
              {file && (
                <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Selected: <span className="text-foreground font-medium">{file.name}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="px-6 py-3 gradient-primary text-white rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Import Students
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Import Results</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-400">
                  {results.imported}
                </div>
                <div className="text-sm text-green-400/80">Imported</div>
              </div>
              <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-400">
                  {results.failed}
                </div>
                <div className="text-sm text-red-400/80">Failed</div>
              </div>
              <div className="text-center p-6 bg-primary/10 border border-primary/20 rounded-xl">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">
                  {results.invitesSent}
                </div>
                <div className="text-sm text-primary/80">Invites Sent</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Errors:</h4>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {results.errors.map((error: any, idx: number) => (
                    <div key={idx} className="text-sm text-red-400/90 mb-2">
                      Row {error.row}: {error.error}
                      {error.email && ` (${error.email})`}
                      {error.rollNo && ` (${error.rollNo})`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.failed === 0 && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-400">
                  All students imported successfully! Redirecting...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
