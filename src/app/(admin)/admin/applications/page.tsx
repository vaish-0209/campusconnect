"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Filter, Edit2, CheckCircle, XCircle, Clock, Award, FileText, Upload } from "lucide-react";

interface Application {
  id: string;
  status: string;
  remarks: string | null;
  appliedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNo: string;
    branch: string;
    cgpa: number;
  };
  drive: {
    id: string;
    title: string;
    role: string;
    company: {
      name: string;
      logo: string | null;
    };
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDrive, setSelectedDrive] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchDrives();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, selectedDrive, selectedStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrives = async () => {
    try {
      const response = await fetch("/api/admin/drives?limit=100");
      if (response.ok) {
        const data = await response.json();
        setDrives(data.drives);
      }
    } catch (error) {
      console.error("Error fetching drives:", error);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          `${app.student.firstName} ${app.student.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.drive.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDrive !== "all") {
      filtered = filtered.filter((app) => app.drive.id === selectedDrive);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((app) => app.status === selectedStatus);
    }

    setFilteredApplications(filtered);
  };

  const startEditing = (app: Application) => {
    setEditingId(app.id);
    setEditStatus(app.status);
    setEditRemarks(app.remarks || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditStatus("");
    setEditRemarks("");
  };

  const handleUpdateStatus = async (applicationId: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          remarks: editRemarks || null,
        }),
      });

      if (response.ok) {
        await fetchApplications();
        cancelEditing();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "SHORTLISTED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "TEST_CLEARED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "INTERVIEW_CLEARED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "OFFER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OFFER":
        return <Award className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "INTERVIEW_CLEARED":
      case "TEST_CLEARED":
      case "SHORTLISTED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  const statusOptions = [
    "APPLIED",
    "SHORTLISTED",
    "TEST_CLEARED",
    "INTERVIEW_CLEARED",
    "OFFER",
    "REJECTED",
  ];

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
                <Link href="/admin/applications" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
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
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Applications Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Track and update student application statuses
            </p>
          </div>
          <Link
            href="/admin/bulk-update"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-all font-medium"
          >
            <Upload className="w-5 h-5" />
            Bulk Update
          </Link>
        </div>

        {/* Filters */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search student, roll no, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
              />
            </div>

            {/* Drive Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={selectedDrive}
                onChange={(e) => setSelectedDrive(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none appearance-none"
              >
                <option value="all">All Drives</option>
                {drives.map((drive) => (
                  <option key={drive.id} value={drive.id}>
                    {drive.company.name} - {drive.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {applications.length}</span>
            <span>•</span>
            <span>Filtered: {filteredApplications.length}</span>
          </div>
        </div>

        {/* Applications Table */}
        <div className="glass-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company & Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-card/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-foreground">
                            {app.student.rollNo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {app.student.firstName} {app.student.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {app.student.branch} • CGPA: {app.student.cgpa}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {app.drive.company.logo && (
                            <img
                              src={app.drive.company.logo}
                              alt={app.drive.company.name}
                              className="w-10 h-10 rounded object-contain"
                            />
                          )}
                          <div>
                            <div className="font-medium text-foreground">
                              {app.drive.company.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {app.drive.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === app.id ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="px-3 py-2 bg-card border border-border/50 text-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            {formatStatus(app.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === app.id ? (
                          <input
                            type="text"
                            value={editRemarks}
                            onChange={(e) => setEditRemarks(e.target.value)}
                            placeholder="e.g., Cleared Technical Round 1"
                            className="w-full px-3 py-2 bg-card border border-border/50 text-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {app.remarks || "-"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground">
                          {new Date(app.appliedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === app.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(app.id)}
                              disabled={updating}
                              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                            >
                              {updating ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={updating}
                              className="px-3 py-1.5 bg-card border border-border/50 text-foreground rounded-lg text-sm font-medium hover:bg-secondary/50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(app)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4 text-primary" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        {searchTerm || selectedDrive !== "all" || selectedStatus !== "all"
                          ? "No applications found matching your filters"
                          : "No applications yet"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
