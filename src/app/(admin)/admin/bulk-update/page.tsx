"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function BulkStatusUpdatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        alert("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/applications/bulk-update", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setFile(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update statuses");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = `rollNo,status,remarks
1MS21CS001,SHORTLISTED,Cleared screening round
1MS21CS002,TEST_CLEARED,Scored 85% in online test
1MS21CS003,REJECTED,Did not meet minimum criteria`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_status_update_sample.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/applications"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Bulk Status Update</h1>
                <p className="text-sm text-muted-foreground">
                  Update multiple student application statuses via CSV upload
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Upload a CSV file with columns: <code className="bg-card px-2 py-0.5 rounded">rollNo</code>, <code className="bg-card px-2 py-0.5 rounded">status</code>, <code className="bg-card px-2 py-0.5 rounded">remarks</code></li>
                <li>• Valid statuses: APPLIED, SHORTLISTED, TEST_CLEARED, INTERVIEW_CLEARED, OFFER, REJECTED</li>
                <li>• Remarks column is optional</li>
                <li>• Students will be notified via email and in-app notification</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Download Sample */}
        <div className="mb-8">
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg hover:border-primary/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Download Sample CSV
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-lg p-8">
          <label className="block mb-6">
            <span className="block text-sm font-medium text-foreground mb-3">
              Upload CSV File
            </span>
            {file ? (
              <div className="flex items-center gap-3 p-4 bg-background border border-border/50 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
                <span className="flex-1 text-foreground">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-background hover:bg-secondary/20 transition-all">
                <Upload className="w-12 h-12 mb-3 text-primary" />
                <p className="text-sm text-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </label>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload and Update
              </>
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-card border border-border/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Update Results</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{result.success}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <XCircle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{result.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Errors:</h4>
                <ul className="space-y-1 text-sm text-red-400">
                  {result.errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
