"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Building2, MapPin, Calendar, Users, CheckCircle, XCircle, Clock, Briefcase, IndianRupee } from "lucide-react";
import { StudentNavbar } from "@/components/student/StudentNavbar";

interface Drive {
  id: string;
  title: string;
  role: string;
  jobDescription: string;
  ctc: number | null;
  ctcBreakup: string | null;
  location: string | null;
  bond: string | null;
  techStack: string | null;
  positionsAvailable: number | null;
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
      <StudentNavbar />

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.length > 0 ? (
            filteredDrives.map((drive) => {
              const deadline = getDeadlineStatus(drive.registrationEnd);
              const isPastDeadline = new Date(drive.registrationEnd) < new Date();

              return (
                <div key={drive.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    {drive.company.logo ? (
                      <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center p-1.5 flex-shrink-0">
                        <img src={drive.company.logo} alt={drive.company.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-0.5 truncate">{drive.company.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 truncate">{drive.role}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {drive.hasApplied ? (
                          <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                            Applied
                          </span>
                        ) : drive.isEligible ? (
                          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            Eligible
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                            Not Eligible
                          </span>
                        )}
                        <span className={`text-xs font-medium flex items-center gap-1 ${deadline.color}`}>
                          <Clock className="w-3 h-3" />
                          {deadline.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {drive.ctc && (
                      <div className="flex items-start gap-2">
                        <IndianRupee className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">CTC</p>
                          <p className="font-semibold text-foreground text-sm">₹{drive.ctc} LPA</p>
                        </div>
                      </div>
                    )}
                    {drive.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-semibold text-foreground text-sm truncate">{drive.location}</p>
                        </div>
                      </div>
                    )}
                    {drive.positionsAvailable && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Openings</p>
                          <p className="font-semibold text-foreground text-sm">{drive.positionsAvailable}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="font-semibold text-foreground text-sm">{new Date(drive.registrationEnd).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link
                    href={`/student/drives/${drive.id}`}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-center transition-all flex items-center justify-center gap-2 ${
                      drive.hasApplied
                        ? "bg-secondary/50 text-foreground hover:bg-secondary"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    }`}
                  >
                    {drive.hasApplied ? "View Application" : "View Full Details & Apply"}
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No drives found for this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
