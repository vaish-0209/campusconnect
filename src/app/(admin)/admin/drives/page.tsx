"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus, Search, Filter, Zap, Calendar, Users } from "lucide-react";

interface Drive {
  id: string;
  title: string;
  role: string;
  ctc: number | null;
  minCgpa: number | null;
  maxBacklogs: number;
  allowedBranches: string | null;
  registrationStart: string;
  registrationEnd: string;
  isActive: boolean;
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
  applicationsCount: number;
}

function DrivesContent() {
  const searchParams = useSearchParams();
  const companyFromUrl = searchParams.get("company") || "";

  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState(companyFromUrl);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Sync companyFilter with URL parameter
  useEffect(() => {
    console.log("🎯 Company from URL:", companyFromUrl);
    if (companyFromUrl !== companyFilter) {
      console.log("✅ Updating companyFilter to:", companyFromUrl);
      setCompanyFilter(companyFromUrl);
    }
  }, [companyFromUrl]);

  useEffect(() => {
    console.log("🔄 useEffect triggered - companyFilter:", companyFilter);
    fetchDrives();
  }, [search, statusFilter, companyFilter, page]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("active", statusFilter);
      if (companyFilter) params.append("company", companyFilter);

      const url = `/api/admin/drives?${params}`;
      console.log("🌐 Fetching drives with URL:", url);
      console.log("📋 Current companyFilter state:", companyFilter);
      console.log("🔗 Full params object:", Object.fromEntries(params.entries()));

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDrives(data.drives);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching drives:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDriveStatus = async (driveId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/drives/${driveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchDrives();
      } else {
        alert("Failed to update drive status");
      }
    } catch (error) {
      console.error("Error updating drive:", error);
      alert("An error occurred");
    }
  };

  const totalPages = Math.ceil(total / limit);

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
                <Link href="/admin/students" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Students
                </Link>
                <Link href="/admin/companies" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Companies
                </Link>
                <Link href="/admin/drives" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
                  Drives
                </Link>
                <Link href="/admin/applications" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Applications
                </Link>
                <Link href="/admin/events" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Events
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/analytics" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                Analytics
              </Link>
              
                <Link href="/signout" className="px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all">
                  Logout
                </Link>
              
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Drive Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Create and manage placement drives
            </p>
          </div>
          <Link
            href="/admin/drives/new"
            className="gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Drive
          </Link>
        </div>

        {/* Company Filter Badge */}
        {companyFilter && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtering by:</span>
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium flex items-center gap-2">
              {companyFilter}
              <button
                onClick={() => setCompanyFilter("")}
                className="hover:text-primary/80"
              >
                ×
              </button>
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by company or role..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-end">
              Total Drives: <span className="font-semibold ml-2 text-foreground">{total}</span>
            </div>
          </div>
        </div>

        {/* Drives Table */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : drives.length === 0 ? (
          <div className="glass-card border border-border/50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No drives found
            </h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? "Try adjusting your search filters"
                : "Create your first placement drive"}
            </p>
            <Link
              href="/admin/drives/new"
              className="inline-block gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all"
            >
              Create Drive
            </Link>
          </div>
        ) : (
          <>
            <div className="glass-card border border-border/50 rounded-xl overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      CTC
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {drives.map((drive) => {
                    const now = new Date();
                    const regStart = new Date(drive.registrationStart);
                    const regEnd = new Date(drive.registrationEnd);
                    const isOpen = now >= regStart && now <= regEnd;
                    const isPast = now > regEnd;
                    const branches = drive.allowedBranches ? drive.allowedBranches.split(',').map(b => b.trim()).filter(b => b) : [];

                    return (
                      <tr key={drive.id} className="hover:bg-card/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {drive.company.logo ? (
                              <img
                                src={drive.company.logo}
                                alt={drive.company.name}
                                className="w-10 h-10 object-contain rounded-lg bg-card p-1 mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary/10 rounded-lg mr-3 flex items-center justify-center border border-primary/20">
                                <span className="text-sm font-bold text-primary">
                                  {drive.company.name[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {drive.company.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {drive.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {drive.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {drive.ctc ? `₹${drive.ctc} LPA` : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          <div className="space-y-1 w-32">
                            <div className="whitespace-nowrap">
                              Start: {new Date(drive.registrationStart).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                            <div className="whitespace-nowrap">
                              End: {new Date(drive.registrationEnd).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                            {isOpen && (
                              <span className="inline-block px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                                Open Now
                              </span>
                            )}
                            {isPast && (
                              <span className="text-muted-foreground/60">Closed</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              toggleDriveStatus(drive.id, drive.isActive)
                            }
                            className={`px-3 py-1 text-xs rounded-full transition-all ${
                              drive.isActive
                                ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                                : "bg-muted/10 text-muted-foreground border border-muted/20 hover:bg-muted/20"
                            }`}
                          >
                            {drive.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/drives/${drive.id}`}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-3">
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
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDrivesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DrivesContent />
    </Suspense>
  );
}
