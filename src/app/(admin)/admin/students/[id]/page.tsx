"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, User, Mail, Phone, GraduationCap, FileText, Award, AlertCircle, Download, Edit, RefreshCw, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface StudentDetail {
  id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  email: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  phone: string | null;
  profilePhoto: string | null;
  skills: string[] | null;
  isActive: boolean;
  resume: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
    size?: number;
  } | null;
  applications: Array<{
    id: string;
    status: string;
    appliedAt: string;
    resumeUrl: string | null;
    drive: {
      id: string;
      title: string;
      role: string;
      company: {
        name: string;
        logo: string | null;
      };
    };
  }>;
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBacklogs, setEditingBacklogs] = useState(false);
  const [backlogsValue, setBacklogsValue] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
    setupUrl?: string;
  } | null>(null);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/students/${studentId}/detail`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data.student);
        setBacklogsValue(data.student.backlogs);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBacklogs = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backlogs: backlogsValue }),
      });
      if (response.ok) {
        await fetchStudent();
        setEditingBacklogs(false);
      }
    } catch (error) {
      console.error("Error updating backlogs:", error);
    } finally {
      setUpdating(false);
    }
  };

  const toggleAccountStatus = () => {
    if (!student) return;
    setConfirmAction({
      title: `${student.isActive ? "Deactivate" : "Activate"} Account`,
      message: `Are you sure you want to ${student.isActive ? "deactivate" : "activate"} this account? ${student.isActive ? "The student will not be able to log in." : "The student will be able to log in."}`,
      onConfirm: async () => {
        try {
          setUpdating(true);
          const response = await fetch(`/api/admin/students/${studentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !student.isActive }),
          });
          if (response.ok) {
            await fetchStudent();
          }
        } catch (error) {
          console.error("Error toggling account status:", error);
        } finally {
          setUpdating(false);
          setShowConfirmDialog(false);
        }
      },
    });
    setShowConfirmDialog(true);
  };

  const resendInvite = () => {
    setConfirmAction({
      title: "Resend Invite Email",
      message: "Send account setup instructions to this student's email?",
      onConfirm: async () => {
        try {
          setUpdating(true);
          const response = await fetch(`/api/admin/students/${studentId}/resend-invite`, {
            method: "POST",
          });
          if (response.ok) {
            const data = await response.json();
            setShowConfirmDialog(false);
            setSuccessMessage({
              title: "Invite Sent Successfully!",
              message: `Account setup email has been sent to ${student?.email}`,
              setupUrl: data.setupUrl,
            });
            setShowSuccessModal(true);
          } else {
            alert("Failed to send invite email");
          }
        } catch (error) {
          console.error("Error resending invite:", error);
          alert("Error sending invite email");
        } finally {
          setUpdating(false);
        }
      },
    });
    setShowConfirmDialog(true);
  };

  const downloadApplicationData = () => {
    if (!student) return;

    const csvContent = [
      ["Company", "Role", "Status", "Applied Date", "Resume URL"],
      ...student.applications.map(app => [
        app.drive.company.name,
        app.drive.role,
        app.status,
        new Date(app.appliedAt).toLocaleDateString(),
        app.resumeUrl || "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.rollNo}_applications.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Student not found</h2>
          <Link href="/admin/students" className="text-primary hover:text-primary/80">
            Back to Students
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <Link href="/admin/students" className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm mb-4 inline-flex font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Link>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Student Profile
          </h2>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Applications</p>
                <p className="text-3xl font-bold text-foreground">{student.applications.length}</p>
              </div>
              <FileText className="w-10 h-10 text-primary/30" />
            </div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Offers</p>
                <p className="text-3xl font-bold text-green-400">{student.applications.filter(a => a.status === "OFFER").length}</p>
              </div>
              <Award className="w-10 h-10 text-green-400/30" />
            </div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Shortlisted</p>
                <p className="text-3xl font-bold text-primary">{student.applications.filter(a => ["SHORTLISTED", "TEST_CLEARED", "INTERVIEW_CLEARED"].includes(a.status)).length}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary/30" />
            </div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-foreground">
                  {student.applications.length > 0
                    ? Math.round((student.applications.filter(a => a.status === "OFFER").length / student.applications.length) * 100)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-muted-foreground/30" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card border border-border/50 rounded-xl p-6">
              <div className="text-center mb-6">
                {student.profilePhoto ? (
                  <img src={student.profilePhoto} alt={`${student.firstName} ${student.lastName}`} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-primary/20" />
                ) : (
                  <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-primary/20">
                    <span className="text-4xl font-bold text-primary">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-muted-foreground">{student.rollNo}</p>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-card border border-border/50 rounded-lg">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </label>
                  <p className="text-foreground text-sm">{student.email}</p>
                </div>
                <div className="p-3 bg-card border border-border/50 rounded-lg">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                    <GraduationCap className="w-3 h-3" />
                    Branch
                  </label>
                  <p className="text-foreground font-semibold">{student.branch}</p>
                </div>
                <div className="p-3 bg-card border border-border/50 rounded-lg">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Phone className="w-3 h-3" />
                    Phone
                  </label>
                  <p className="text-foreground text-sm">{student.phone || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-card border border-border/50 rounded-lg">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">CGPA</label>
                    <p className="text-2xl font-bold text-primary">{student.cgpa.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-card border border-border/50 rounded-lg">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-between">
                      Backlogs
                      {!editingBacklogs && (
                        <button onClick={() => setEditingBacklogs(true)} className="text-primary hover:text-primary/80">
                          <Edit className="w-3 h-3" />
                        </button>
                      )}
                    </label>
                    {editingBacklogs ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={backlogsValue}
                          onChange={(e) => setBacklogsValue(parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
                          min="0"
                        />
                        <button onClick={updateBacklogs} disabled={updating} className="text-green-400 hover:text-green-300">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingBacklogs(false); setBacklogsValue(student.backlogs); }} className="text-red-400 hover:text-red-300">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{student.backlogs}</p>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-card border border-border/50 rounded-lg">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Account Status</label>
                  <div className="flex items-center justify-between">
                    {student.isActive ? (
                      <span className="px-3 py-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full inline-flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 text-xs bg-muted/10 text-muted-foreground border border-muted/20 rounded-full inline-flex items-center gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        Inactive
                      </span>
                    )}
                    <button
                      onClick={toggleAccountStatus}
                      disabled={updating}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      {student.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Section */}
            {student.resume && (
              <div className="glass-card border border-border/50 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Resume
                </h4>
                <div className="p-4 bg-card border border-border/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{student.resume.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(student.resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={student.resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    View / Download Resume
                  </a>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="glass-card border border-border/50 rounded-xl p-6 space-y-3">
              <h4 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h4>
              {!student.isActive && (
                <button
                  onClick={resendInvite}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend Invite Email
                </button>
              )}
              <button
                onClick={downloadApplicationData}
                className="w-full px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg hover:border-primary/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download Applications CSV
              </button>
            </div>
          </div>

          {/* Applications and Offers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offers Section */}
            {student.applications.filter(a => a.status === "OFFER").length > 0 && (
              <div className="glass-card border border-green-500/30 rounded-xl p-6 bg-green-500/5">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Offers Received ({student.applications.filter(a => a.status === "OFFER").length})
                </h3>
                <div className="space-y-4">
                  {student.applications.filter(a => a.status === "OFFER").map((app) => (
                    <div key={app.id} className="glass-card border border-green-500/30 rounded-lg p-5 bg-green-500/5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4">
                          {app.drive.company.logo ? (
                            <img
                              src={app.drive.company.logo}
                              alt={app.drive.company.name}
                              className="w-12 h-12 object-contain rounded-lg border border-border/50 p-2"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                              <span className="text-sm font-bold text-primary">
                                {app.drive.company.name[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="text-foreground font-semibold text-lg">{app.drive.company.name}</h4>
                            <p className="text-sm text-muted-foreground">{app.drive.role}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          OFFER
                        </span>
                      </div>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          View Resume Used
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Applications */}
            <div className="glass-card border border-border/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                All Applications ({student.applications.length})
              </h3>

              {student.applications.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {student.applications.map((app) => (
                    <div key={app.id} className="glass-card border border-border/50 rounded-lg p-5 hover:border-primary/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4">
                          {app.drive.company.logo ? (
                            <img
                              src={app.drive.company.logo}
                              alt={app.drive.company.name}
                              className="w-12 h-12 object-contain rounded-lg border border-border/50 p-2"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                              <span className="text-sm font-bold text-primary">
                                {app.drive.company.name[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="text-foreground font-semibold">{app.drive.company.name}</h4>
                            <p className="text-sm text-muted-foreground">{app.drive.role}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium border ${
                          app.status === "OFFER"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : app.status === "REJECTED"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : app.status === "SHORTLISTED"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted/10 text-muted-foreground border-muted/20"
                        }`}>
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          View Resume
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowConfirmDialog(false)}>
          <div className="glass-card border border-border/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{confirmAction.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{confirmAction.message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={updating}
                className="px-6 py-2.5 bg-card border border-border/50 text-foreground rounded-lg hover:border-border transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                disabled={updating}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-50"
              >
                {updating ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowSuccessModal(false)}>
          <div className="glass-card border border-primary/30 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border-2 border-green-500/30 mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{successMessage.title}</h3>
              <p className="text-muted-foreground">{successMessage.message}</p>
            </div>

            {successMessage.setupUrl && (
              <div className="mb-6 p-4 bg-card/50 border border-border/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-2">Setup URL:</p>
                    <div className="bg-background/50 border border-border/30 rounded px-3 py-2 font-mono text-xs text-muted-foreground break-all">
                      {successMessage.setupUrl}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(successMessage.setupUrl!);
                        alert("URL copied to clipboard!");
                      }}
                      className="mt-2 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 gradient-primary text-white rounded-lg hover:opacity-90 transition-all font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
