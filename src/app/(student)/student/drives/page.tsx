"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Building2, MapPin, DollarSign, Calendar, Users, CheckCircle, XCircle, Clock, Briefcase } from "lucide-react";

interface Drive {
  id: string;
  title: string;
  role: string;
  ctc: number | null;
  location: string | null;
  minCgpa: number | null;
  maxBacklogs: number;
  allowedBranches: string[];
  registrationStart: string;
  registrationEnd: string;
  isActive: boolean;
  company: {
    name: string;
    logo: string | null;
  };
  isEligible: boolean;
  hasApplied: boolean;
  applicationStatus?: string;
}

export default function StudentDrivesPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/drives");
      if (response.ok) {
        const data = await response.json();
        setDrives(data.drives);
      }
    } catch (error) {
      console.error("Error fetching drives:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyToDrive = async (driveId: string) => {
    try {
      const response = await fetch(`/api/student/drives/${driveId}`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        fetchDrives();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to apply");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const filteredDrives = drives.filter((drive) => {
    if (filter === "eligible") return drive.isEligible && !drive.hasApplied;
    if (filter === "applied") return drive.hasApplied;
    if (filter === "notEligible") return !drive.isEligible;
    return true;
  });

  const getDeadlineStatus = (deadline: string) => {
    const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { text: "Closed", color: "text-red-400" };
    if (daysLeft === 0) return { text: "Today", color: "text-orange-400" };
    if (daysLeft === 1) return { text: "1 day left", color: "text-orange-400" };
    if (daysLeft <= 3) return { text: `${daysLeft} days left`, color: "text-yellow-400" };
    return { text: `${daysLeft} days left`, color: "text-green-400" };
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-foreground tracking-wide">
                Campus<span className="text-primary">Connect</span>
              </h1>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/student/dashboard" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Dashboard
                </Link>
                <Link href="/student/drives" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
                  Drives
                </Link>
                <Link href="/student/companies" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Companies
                </Link>
                <Link href="/student/applications" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Applications
                </Link>
                <Link href="/student/calendar" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Calendar
                </Link>
              </div>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Placement Drives
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse and apply to available placement opportunities
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          {[
            { key: "all", label: "All Drives", count: drives.length },
            { key: "eligible", label: "Eligible", count: drives.filter(d => d.isEligible && !d.hasApplied).length },
            { key: "applied", label: "Applied", count: drives.filter(d => d.hasApplied).length },
            { key: "notEligible", label: "Not Eligible", count: drives.filter(d => !d.isEligible).length },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                filter === item.key
                  ? "bg-primary text-white"
                  : "bg-card border border-border/50 text-foreground hover:border-primary/30"
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        {/* Drives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDrives.length > 0 ? (
            filteredDrives.map((drive) => {
              const deadline = getDeadlineStatus(drive.registrationEnd);
              const isPastDeadline = new Date(drive.registrationEnd) < new Date();

              return (
                <div key={drive.id} className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    {drive.company.logo ? (
                      <img src={drive.company.logo} alt={drive.company.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-1">{drive.company.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{drive.role}</p>
                      <div className="flex items-center gap-2">
                        {drive.hasApplied ? (
                          <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium">
                            Applied
                          </span>
                        ) : drive.isEligible ? (
                          <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
                            Eligible
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium">
                            Not Eligible
                          </span>
                        )}
                        <span className={`text-xs font-medium ${deadline.color}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {deadline.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {drive.ctc && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>₹{drive.ctc} LPA</span>
                      </div>
                    )}
                    {drive.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{drive.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(drive.registrationEnd).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>Min CGPA: {drive.minCgpa || "N/A"}</span>
                      <span>Max Backlogs: {drive.maxBacklogs}</span>
                    </div>
                    {drive.hasApplied ? (
                      <Link
                        href="/student/applications"
                        className="w-full py-3 px-4 bg-secondary/50 border border-border rounded-lg font-medium text-center transition-all hover:bg-secondary flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        View Application
                      </Link>
                    ) : drive.isEligible && !isPastDeadline ? (
                      <button
                        onClick={() => applyToDrive(drive.id)}
                        className="w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
                      >
                        Apply Now
                      </button>
                    ) : isPastDeadline ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-card border border-border/50 text-muted-foreground rounded-lg font-medium cursor-not-allowed opacity-50"
                      >
                        Registration Closed
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-card border border-border/50 text-muted-foreground rounded-lg font-medium cursor-not-allowed opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Not Eligible
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No drives found for this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
