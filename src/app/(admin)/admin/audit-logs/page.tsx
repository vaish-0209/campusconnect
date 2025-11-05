"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Shield, Search, Filter, Download, Calendar, User, Activity } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  target: string;
  targetId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  meta: any;
  createdAt: string;
  user: {
    email: string;
    role: string;
  };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter, targetFilter, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(actionFilter && { action: actionFilter }),
        ...(targetFilter && { target: targetFilter }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(actionFilter && { action: actionFilter }),
        ...(targetFilter && { target: targetFilter }),
        export: "csv",
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (error) {
      console.error("Error exporting logs:", error);
      alert("Failed to export logs");
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "UPDATE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DELETE":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "VIEW":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && logs.length === 0) {
    return <LoadingSpinner size="lg" />;
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
                <Link href="/admin/students" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Students
                </Link>
                <Link href="/admin/companies" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Companies
                </Link>
                <Link href="/admin/drives" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
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
              
                <button onClick={() => signOut({ callbackUrl: "/login" })}  className="px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all">
                  Logout
                </button>
              
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Audit Logs
            </h2>
            <p className="text-lg text-muted-foreground">
              System activity and security trail
            </p>
          </div>
          <button
            onClick={exportLogs}
            className="gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all font-medium flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by user email..."
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
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none appearance-none"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
              </select>
            </div>

            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={targetFilter}
                onChange={(e) => {
                  setTargetFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none appearance-none"
              >
                <option value="">All Resources</option>
                <option value="Student">Students</option>
                <option value="Company">Companies</option>
                <option value="Drive">Drives</option>
                <option value="Event">Events</option>
                <option value="Application">Applications</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="glass-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-card/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-card/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{log.user.email}</p>
                            <p className="text-xs text-muted-foreground">{log.user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {log.target}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {log.meta && typeof log.meta === "object" ? (
                          <span title={JSON.stringify(log.meta, null, 2)}>
                            {Object.keys(log.meta).length > 0
                              ? JSON.stringify(log.meta).slice(0, 50) + "..."
                              : "No details"}
                          </span>
                        ) : (
                          "No details"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {log.ipAddress || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No audit logs found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} logs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg hover:bg-secondary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-card border border-border/50 text-foreground rounded-lg hover:bg-secondary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
