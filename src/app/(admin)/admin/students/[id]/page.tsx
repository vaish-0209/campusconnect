"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, User, Mail, Phone, GraduationCap, FileText, Award, AlertCircle } from "lucide-react";

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
  isActive: boolean;
  applications: Array<{
    id: string;
    status: string;
    appliedAt: string;
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
      }
    } catch (error) {
      console.error("Error fetching student:", error);
    } finally {
      setLoading(false);
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="glass-card border border-border/50 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-primary/20">
                  <span className="text-4xl font-bold text-primary">
                    {student.firstName[0]}{student.lastName[0]}
                  </span>
                </div>
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
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Backlogs</label>
                    <p className="text-2xl font-bold text-foreground">{student.backlogs}</p>
                  </div>
                </div>
                <div className="p-3 bg-card border border-border/50 rounded-lg">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
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
                </div>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="glass-card border border-border/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Applications ({student.applications.length})
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
                      <div className="flex items-start justify-between">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
