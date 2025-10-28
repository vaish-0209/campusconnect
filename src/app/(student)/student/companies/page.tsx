"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Building2, MapPin, Award, Calendar, CheckCircle, XCircle } from "lucide-react";

interface Drive {
  id: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    sector: string;
    tier: string | null;
  };
  title: string;
  role: string;
  ctc: number | null;
  location: string | null;
  minCgpa: number | null;
  maxBacklogs: number;
  allowedBranches: string[];
  registrationEnd: string;
  isEligible: boolean;
  hasApplied: boolean;
}

export default function CompaniesPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDrives();
  }, [search, page]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/student/drives?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDrives(data.drives);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching drives:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/student/dashboard">
                <h1 className="text-xl font-semibold text-foreground tracking-wide">
                  Campus<span className="text-primary">Connect</span>
                </h1>
              </Link>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/student/dashboard" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Dashboard
                </Link>
                <Link href="/student/drives" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Drives
                </Link>
                <Link href="/student/companies" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
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
            <div className="flex items-center gap-3">
              <Link href="/student/notifications" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                Notifications
              </Link>
              <Link href="/student/profile" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                Profile
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Logout
                </button>
              </form>
            </div>
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

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search companies or roles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Drives List */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : drives.length === 0 ? (
          <div className="glass-card border border-border/50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No drives available
            </h3>
            <p className="text-muted-foreground">
              {search
                ? "No drives match your search. Try different keywords."
                : "Check back later for new placement opportunities!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {drives.map((drive) => (
              <div
                key={drive.id}
                className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {drive.company.logo ? (
                        <img
                          src={drive.company.logo}
                          alt={drive.company.name}
                          className="w-16 h-16 object-contain rounded-lg border border-border/50"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {drive.company.name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Drive Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {drive.company.name}
                        </h3>
                        {drive.company.tier && (
                          <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-full">
                            {drive.company.tier}
                          </span>
                        )}
                      </div>

                      <p className="text-lg text-foreground/90 mb-3">
                        {drive.title}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span className="font-medium text-foreground">Role:</span>
                          <span>{drive.role}</span>
                        </div>
                        {drive.ctc && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">CTC:</span>
                            <span>{formatCurrency(drive.ctc)}</span>
                          </div>
                        )}
                        {drive.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium text-foreground">Location:</span>
                            <span>{drive.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Eligibility */}
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        {drive.minCgpa && (
                          <span className="px-3 py-1 bg-card border border-border/50 text-foreground/80 rounded-full">
                            CGPA ≥ {drive.minCgpa}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-card border border-border/50 text-foreground/80 rounded-full">
                          Max Backlogs: {drive.maxBacklogs}
                        </span>
                        {Array.isArray(drive.allowedBranches) && drive.allowedBranches.length > 0 && (
                          <span className="px-3 py-1 bg-card border border-border/50 text-foreground/80 rounded-full">
                            {drive.allowedBranches.join(", ")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Registration closes:{" "}
                        <span className="font-medium text-foreground">
                          {formatDate(drive.registrationEnd)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-4 flex-shrink-0">
                    {drive.hasApplied ? (
                      <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Applied
                      </div>
                    ) : drive.isEligible ? (
                      <Link
                        href={`/student/companies/${drive.id}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 gradient-primary text-white rounded-lg hover:opacity-90 transition-all font-medium"
                      >
                        View Details
                        <Building2 className="w-4 h-4" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 px-5 py-2.5 bg-muted/10 border border-muted/20 text-muted-foreground rounded-lg font-medium cursor-not-allowed">
                        <XCircle className="w-4 h-4" />
                        Not Eligible
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && drives.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 glass-card border border-border/50 text-foreground rounded-full hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="px-5 py-2 glass-card border border-primary/20 text-foreground rounded-full">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-5 py-2 glass-card border border-border/50 text-foreground rounded-full hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
