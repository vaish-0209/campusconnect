"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Building2, MapPin, Award, Calendar, Users, Upload, Download, FileText, CheckCircle, XCircle, GraduationCap } from "lucide-react";

interface Drive {
  id: string;
  title: string;
  role: string;
  jobDescription: string;
  ctc: number | null;
  ctcBreakup: string | null;
  location: string | null;
  bond: string | null;
  techStack: string[];
  minCgpa: number | null;
  maxBacklogs: number;
  allowedBranches: string[];
  registrationStart: string;
  registrationEnd: string;
  isActive: boolean;
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  remarks: string | null;
  student: {
    id: string;
    rollNo: string;
    firstName: string;
    lastName: string;
    email: string;
    branch: string;
    cgpa: number;
    backlogs: number;
  };
}

export default function DriveDetailPage() {
  const params = useParams();
  const driveId = params.id as string;

  const [drive, setDrive] = useState<Drive | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDriveDetails();
    fetchApplications();
  }, [driveId]);

  useEffect(() => {
    if (drive) {
      fetchApplications();
    }
  }, [statusFilter, branchFilter]);

  const fetchDriveDetails = async () => {
    try {
      const response = await fetch(`/api/admin/drives/${driveId}`);
      if (response.ok) {
        const data = await response.json();
        setDrive(data.drive);
      }
    } catch (error) {
      console.error("Error fetching drive:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        ...(branchFilter && { branch: branchFilter }),
      });

      const response = await fetch(
        `/api/admin/drives/${driveId}/applications?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      APPLIED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      SHORTLISTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      TEST_SCHEDULED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      TEST_CLEARED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      INTERVIEW_SCHEDULED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      INTERVIEW_CLEARED: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      OFFER: "bg-green-500/10 text-green-400 border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
      WITHDRAWN: "bg-muted/10 text-muted-foreground border-muted/20",
    };
    return colors[status] || "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const getStatusCount = (status: string) => {
    return applications.filter((app) => app.status === status).length;
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!drive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Drive not found
          </h2>
          <Link
            href="/admin/drives"
            className="text-primary hover:text-primary/80"
          >
            Back to Drives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/admin/drives" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Drives</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Company Header */}
        <div className="glass-card border border-border/50 rounded-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {drive.company.logo ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-card">
                  <img
                    src={drive.company.logo}
                    alt={drive.company.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <span className="text-3xl font-bold text-primary">{drive.company.name[0]}</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  {drive.company.name}
                </h1>
                {drive.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {drive.location}
                  </p>
                )}
              </div>
            </div>
            <span
              className={`px-4 py-2 text-sm font-medium rounded-full border ${
                drive.isActive
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-muted/10 text-muted-foreground border-muted/20"
              }`}
            >
              {drive.isActive ? "● Active" : "○ Inactive"}
            </span>
          </div>

          {/* Role & Title */}
          <div className="border-t border-border/50 pt-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
                {drive.role}
              </span>
              {drive.ctc && drive.ctc <= 6 && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                  Service Based
                </span>
              )}
              {drive.ctc && drive.ctc > 6 && drive.ctc <= 12 && (
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-medium">
                  Product Based
                </span>
              )}
              {drive.ctc && drive.ctc > 12 && (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium">
                  Premium
                </span>
              )}
              {drive.role.toLowerCase().includes('intern') && (
                <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium">
                  Internship
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground">{drive.title}</h2>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="glass-card border border-border/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Job Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {drive.jobDescription}
              </p>
            </div>

            {/* Tech Stack */}
            {drive.techStack.length > 0 && (
              <div className="glass-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Tech Stack Required
                </h3>
                <div className="flex flex-wrap gap-2">
                  {drive.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 text-sm rounded-lg font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* CTC & Package */}
            <div className="glass-card border border-border/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Package Details
              </h3>
              <div className="space-y-3">
                {drive.ctc && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total CTC</p>
                    <p className="text-2xl font-bold text-primary">₹{drive.ctc} LPA</p>
                  </div>
                )}
                {drive.ctcBreakup && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Breakup</p>
                    <p className="text-sm text-foreground">{drive.ctcBreakup}</p>
                  </div>
                )}
                {drive.bond && (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <p className="text-xs text-amber-600/80 mb-1">Service Bond</p>
                    <p className="text-sm text-foreground">{drive.bond}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="glass-card border border-border/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Eligibility Criteria
              </h3>
              <div className="space-y-3">
                {drive.minCgpa && (
                  <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Minimum CGPA</span>
                    <span className="text-sm font-semibold text-foreground">{drive.minCgpa}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Max Backlogs</span>
                  <span className="text-sm font-semibold text-foreground">{drive.maxBacklogs}</span>
                </div>
                {drive.allowedBranches.length > 0 && (
                  <div className="p-3 bg-card/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Allowed Branches</p>
                    <div className="flex flex-wrap gap-1">
                      {drive.allowedBranches.map((branch, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 text-xs rounded"
                        >
                          {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Period */}
            <div className="glass-card border border-border/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Registration Period
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Starts</p>
                  <p className="text-sm text-foreground font-medium">
                    {new Date(drive.registrationStart).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                <div className="h-px bg-border/50" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ends</p>
                  <p className="text-sm text-foreground font-medium">
                    {new Date(drive.registrationEnd).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="glass-card border border-border/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {applications.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total Applications</div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {getStatusCount("SHORTLISTED")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Shortlisted</div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {getStatusCount("TEST_CLEARED")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Test Cleared</div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-teal-400">
              {getStatusCount("INTERVIEW_CLEARED")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Interview Cleared</div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">
              {getStatusCount("OFFER")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Offers</div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="glass-card border border-border/50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Applications ({applications.length})
            </h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Shortlist
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
            >
              <option value="">All Status</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="TEST_SCHEDULED">Test Scheduled</option>
              <option value="TEST_CLEARED">Test Cleared</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="INTERVIEW_CLEARED">Interview Cleared</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="EEE">EEE</option>
            </select>
          </div>

          {/* Applications Table */}
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No applications yet
              </h3>
              <p className="text-muted-foreground">
                Students will appear here once they apply
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/50">
                <thead className="bg-card/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      CGPA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Backlogs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Applied On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-card/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {app.student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {app.student.firstName} {app.student.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {app.student.branch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {app.student.cgpa.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {app.student.backlogs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {app.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <ShortlistUploadModal
          driveId={driveId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchApplications();
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

// Shortlist Upload Modal Component
function ShortlistUploadModal({
  driveId,
  onClose,
  onSuccess,
}: {
  driveId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim());

    const updates = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const update: any = {};

      headers.forEach((header, index) => {
        update[header] = values[index];
      });

      updates.push(update);
    }

    return updates;
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
      const updates = parseCSV(text);

      const response = await fetch(`/api/admin/drives/${driveId}/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates, notifyStudents: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        if (data.failed === 0) {
          setTimeout(() => onSuccess(), 2000);
        }
      } else {
        alert(data.error || "Failed to upload shortlist");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `rollNo,status,remarks
1BM20CS001,SHORTLISTED,Good performance
1BM20CS002,REJECTED,Did not meet criteria`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shortlist_template.csv";
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="glass-card border border-border/50 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            Upload Shortlist
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-2">Instructions</h3>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
            <li>Download the CSV template</li>
            <li>Fill in student roll numbers and their status</li>
            <li>Valid statuses: APPLIED, SHORTLISTED, TEST_SCHEDULED, TEST_CLEARED, INTERVIEW_SCHEDULED, INTERVIEW_CLEARED, OFFER, REJECTED, WITHDRAWN</li>
            <li>Optionally add remarks for each student</li>
            <li>Upload the completed CSV file</li>
          </ol>
        </div>

        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="px-6 py-3 bg-card border border-border/50 text-foreground rounded-lg hover:border-primary/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setResults(null);
                }
              }}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:gradient-primary file:text-white
                hover:file:opacity-90 file:cursor-pointer
                cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Selected: <span className="text-foreground font-medium">{file.name}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-card border border-border/50 text-foreground rounded-full hover:border-primary/30 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-6 py-3 gradient-primary text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>

        {results && (
          <div className="mt-6 glass-card border border-border/50 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center glass-card border border-border/50 rounded-lg p-4">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">
                  {results.updated}
                </div>
                <div className="text-xs text-muted-foreground">Updated</div>
              </div>
              <div className="text-center glass-card border border-border/50 rounded-lg p-4">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-400">
                  {results.failed}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="text-center glass-card border border-border/50 rounded-lg p-4">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">
                  {results.notificationsSent}
                </div>
                <div className="text-xs text-muted-foreground">Notified</div>
              </div>
            </div>
            {results.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-semibold text-red-400 mb-2">
                  Errors:
                </h4>
                {results.errors.map((error: any, idx: number) => (
                  <div key={idx} className="text-xs text-red-400/90">
                    {error.rollNo}: {error.error}
                  </div>
                ))}
              </div>
            )}
            {results.failed === 0 && (
              <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">All updates successful!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
