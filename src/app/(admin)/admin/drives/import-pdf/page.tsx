"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  Briefcase,
  DollarSign,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface ExtractedData {
  company: {
    name: string;
    website: string;
    description: string;
    industry: string;
  };
  drive: {
    title: string;
    role: string;
    jobDescription: string;
    ctc: number | null;
    ctcBreakup: string;
    location: string;
    bond: string;
    techStack: string[];
    minCgpa: number | null;
    maxBacklogs: number;
    allowedBranches: string[];
    additionalCriteria: string;
  };
  confidence: string;
}

export default function ImportPDFPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [extractedDataList, setExtractedDataList] = useState<
    Array<{ file: string; data: ExtractedData; status: string }>
  >([]);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );

    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const extractPDFs = async () => {
    setExtracting(true);
    const results: Array<{ file: string; data: ExtractedData; status: string }> = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/extract-pdf", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          results.push({
            file: file.name,
            data: result.data,
            status: "extracted",
          });
        } else {
          results.push({
            file: file.name,
            data: {} as ExtractedData,
            status: "error",
          });
          alert(`Failed to extract ${file.name}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error extracting ${file.name}:`, error);
        results.push({
          file: file.name,
          data: {} as ExtractedData,
          status: "error",
        });
      }
    }

    setExtractedDataList(results);
    setExtracting(false);
  };

  const startEdit = (index: number) => {
    setCurrentEditIndex(index);
    setEditedData(JSON.parse(JSON.stringify(extractedDataList[index].data)));
  };

  const saveEdit = () => {
    if (currentEditIndex !== null && editedData) {
      const updated = [...extractedDataList];
      updated[currentEditIndex].data = editedData;
      setExtractedDataList(updated);
      setCurrentEditIndex(null);
      setEditedData(null);
    }
  };

  const cancelEdit = () => {
    setCurrentEditIndex(null);
    setEditedData(null);
  };

  const createCompanyAndDrive = async (index: number) => {
    const item = extractedDataList[index];
    setCreating(true);

    try {
      // Step 1: Create or find company
      let companyId: string;

      // Check if company exists
      const companiesResponse = await fetch("/api/admin/companies");
      if (!companiesResponse.ok) {
        throw new Error("Failed to fetch companies");
      }

      const companiesData = await companiesResponse.json();
      const existingCompany = companiesData.companies.find(
        (c: any) =>
          c.name.toLowerCase() === item.data.company.name.toLowerCase()
      );

      if (existingCompany) {
        companyId = existingCompany.id;
        console.log("✅ Using existing company:", existingCompany.name);
      } else {
        // Create new company
        const companyResponse = await fetch("/api/admin/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.data.company.name,
            website: item.data.company.website || undefined,
            description: item.data.company.description || undefined,
            industry: item.data.company.industry || undefined,
          }),
        });

        if (!companyResponse.ok) {
          const error = await companyResponse.json();
          throw new Error(error.error || "Failed to create company");
        }

        const companyData = await companyResponse.json();
        companyId = companyData.company.id;
        console.log("✅ Created new company:", item.data.company.name);
      }

      // Step 2: Create drive
      const now = new Date();
      const regStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const regEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week later

      const drivePayload = {
        companyId,
        title: item.data.drive.title,
        role: item.data.drive.role,
        jobDescription: item.data.drive.jobDescription,
        ...(item.data.drive.ctc && { ctc: item.data.drive.ctc }),
        ...(item.data.drive.ctcBreakup && {
          ctcBreakup: item.data.drive.ctcBreakup,
        }),
        ...(item.data.drive.location && { location: item.data.drive.location }),
        ...(item.data.drive.bond && { bond: item.data.drive.bond }),
        techStack: item.data.drive.techStack || [],
        ...(item.data.drive.minCgpa && { minCgpa: item.data.drive.minCgpa }),
        maxBacklogs: item.data.drive.maxBacklogs || 0,
        allowedBranches: item.data.drive.allowedBranches || [],
        registrationStart: regStart.toISOString(),
        registrationEnd: regEnd.toISOString(),
      };

      const driveResponse = await fetch("/api/admin/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drivePayload),
      });

      if (!driveResponse.ok) {
        const error = await driveResponse.json();
        throw new Error(error.error || "Failed to create drive");
      }

      console.log("✅ Created drive:", item.data.drive.title);

      // Update status
      const updated = [...extractedDataList];
      updated[index].status = "created";
      setExtractedDataList(updated);

      alert(
        `✅ Successfully created company "${item.data.company.name}" and drive "${item.data.drive.title}"!`
      );
    } catch (error: any) {
      console.error("Error creating company/drive:", error);
      alert(`❌ Failed: ${error.message}`);

      const updated = [...extractedDataList];
      updated[index].status = "error";
      setExtractedDataList(updated);
    } finally {
      setCreating(false);
    }
  };

  const createAll = async () => {
    for (let i = 0; i < extractedDataList.length; i++) {
      if (extractedDataList[i].status === "extracted") {
        await createCompanyAndDrive(i);
      }
    }

    alert("✅ All drives created! Redirecting to drives page...");
    setTimeout(() => router.push("/admin/drives"), 2000);
  };

  const branches = ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/admin/drives"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Drives</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 flex items-center gap-3">
            <Sparkles className="w-12 h-12 text-primary" />
            AI-Powered PDF Import
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload placement PDFs and let AI extract company and drive details
            automatically
          </p>
        </div>

        {/* Upload Section */}
        {extractedDataList.length === 0 && (
          <div className="glass-card border border-border/50 rounded-xl p-8 mb-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Drop PDF files here
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 gradient-primary text-white rounded-full cursor-pointer hover:opacity-90 transition-all"
              >
                Select PDFs
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Selected Files ({files.length})
                </h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm text-foreground">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={extractPDFs}
                  disabled={extracting}
                  className="w-full mt-6 px-6 py-3 gradient-primary text-white rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Extracting PDFs with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Extract with AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Extracted Data List */}
        {extractedDataList.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">
                Extracted Data ({extractedDataList.length} files)
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setExtractedDataList([]);
                    setFiles([]);
                  }}
                  className="px-6 py-2 bg-card border border-border/50 text-foreground rounded-full hover:bg-card/80 transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={createAll}
                  disabled={creating}
                  className="px-6 py-2 gradient-primary text-white rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create All"
                  )}
                </button>
              </div>
            </div>

            {extractedDataList.map((item, index) => (
              <div
                key={index}
                className="glass-card border border-border/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        {item.file}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {item.data.confidence}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.status === "created" && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {item.status === "error" && (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                    {item.status === "extracted" && (
                      <>
                        {currentEditIndex === index ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg hover:bg-card/80 transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(index)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => createCompanyAndDrive(index)}
                              disabled={creating}
                              className="px-4 py-2 gradient-primary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                            >
                              Create
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Display/Edit Form */}
                {currentEditIndex === index && editedData ? (
                  <div className="space-y-6">
                    {/* Company Section */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Company Information
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            value={editedData.company.name}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                company: {
                                  ...editedData.company,
                                  name: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Website
                          </label>
                          <input
                            type="text"
                            value={editedData.company.website}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                company: {
                                  ...editedData.company,
                                  website: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Description
                          </label>
                          <textarea
                            value={editedData.company.description}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                company: {
                                  ...editedData.company,
                                  description: e.target.value,
                                },
                              })
                            }
                            rows={2}
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Drive Section */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Drive Details
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={editedData.drive.title}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                drive: {
                                  ...editedData.drive,
                                  title: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Role *
                          </label>
                          <input
                            type="text"
                            value={editedData.drive.role}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                drive: {
                                  ...editedData.drive,
                                  role: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Job Description
                          </label>
                          <textarea
                            value={editedData.drive.jobDescription}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                drive: {
                                  ...editedData.drive,
                                  jobDescription: e.target.value,
                                },
                              })
                            }
                            rows={3}
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            CTC (LPA)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editedData.drive.ctc || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                drive: {
                                  ...editedData.drive,
                                  ctc: e.target.value
                                    ? parseFloat(e.target.value)
                                    : null,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={editedData.drive.location}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                drive: {
                                  ...editedData.drive,
                                  location: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Min CGPA
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editedData.drive.minCgpa || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                drive: {
                                  ...editedData.drive,
                                  minCgpa: e.target.value
                                    ? parseFloat(e.target.value)
                                    : null,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Max Backlogs
                          </label>
                          <input
                            type="number"
                            value={editedData.drive.maxBacklogs}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                drive: {
                                  ...editedData.drive,
                                  maxBacklogs: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Allowed Branches
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {branches.map((branch) => (
                              <button
                                key={branch}
                                type="button"
                                onClick={() => {
                                  const newBranches = editedData.drive.allowedBranches.includes(
                                    branch
                                  )
                                    ? editedData.drive.allowedBranches.filter(
                                        (b) => b !== branch
                                      )
                                    : [
                                        ...editedData.drive.allowedBranches,
                                        branch,
                                      ];
                                  setEditedData({
                                    ...editedData,
                                    drive: {
                                      ...editedData.drive,
                                      allowedBranches: newBranches,
                                    },
                                  });
                                }}
                                className={`px-3 py-1 rounded-lg border transition-all text-sm ${
                                  editedData.drive.allowedBranches.includes(
                                    branch
                                  )
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-card border-border/50 text-muted-foreground"
                                }`}
                              >
                                {branch}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Company Display */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Company
                      </h5>
                      <div className="space-y-2 text-sm">
                        <p className="text-foreground font-medium">
                          {item.data.company.name || "N/A"}
                        </p>
                        {item.data.company.website && (
                          <p className="text-muted-foreground">
                            {item.data.company.website}
                          </p>
                        )}
                        {item.data.company.description && (
                          <p className="text-muted-foreground">
                            {item.data.company.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Drive Display */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Drive
                      </h5>
                      <div className="space-y-2 text-sm">
                        <p className="text-foreground font-medium">
                          {item.data.drive.title}
                        </p>
                        <p className="text-muted-foreground">
                          Role: {item.data.drive.role}
                        </p>
                        {item.data.drive.ctc && (
                          <p className="text-muted-foreground">
                            CTC: {item.data.drive.ctc} LPA
                          </p>
                        )}
                        {item.data.drive.minCgpa && (
                          <p className="text-muted-foreground">
                            Min CGPA: {item.data.drive.minCgpa}
                          </p>
                        )}
                        {item.data.drive.allowedBranches.length > 0 && (
                          <p className="text-muted-foreground">
                            Branches:{" "}
                            {item.data.drive.allowedBranches.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
