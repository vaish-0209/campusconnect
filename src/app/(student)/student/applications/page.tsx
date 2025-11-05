"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileText, Clock, Filter, CheckCircle, XCircle, Briefcase } from "lucide-react";
import { StudentNavbar } from "@/components/student/StudentNavbar";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  resumeUrl: string | null;
  remarks: string | null;
  drive: {
    id: string;
    company: {
      name: string;
      logo: string | null;
    };
    title: string;
    role: string;
    ctc: number | null;
  };
}

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHORTLISTED: "bg-primary/10 text-primary border-primary/20",
  TEST_SCHEDULED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  TEST_CLEARED: "bg-green-500/10 text-green-400 border-green-500/20",
  INTERVIEW_SCHEDULED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  INTERVIEW_CLEARED: "bg-green-500/10 text-green-400 border-green-500/20",
  OFFER: "bg-green-500/10 text-green-400 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  WITHDRAWN: "bg-muted/10 text-muted-foreground border-muted/20",
};

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  TEST_SCHEDULED: "Test Scheduled",
  TEST_CLEARED: "Test Cleared",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEW_CLEARED: "Interview Cleared",
  OFFER: "🎉 Offer Received",
  REJECTED: "Not Selected",
  WITHDRAWN: "Withdrawn",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);

      const response = await fetch(`/api/student/applications?${params}`);
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

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    shortlisted: applications.filter((a) =>
      ["SHORTLISTED", "TEST_CLEARED", "INTERVIEW_CLEARED"].includes(a.status)
    ).length,
    offers: applications.filter((a) => a.status === "OFFER").length,
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      <StudentNavbar />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            My Applications
          </h2>
          <p className="text-lg text-muted-foreground">
            Track the status of all your placement applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Applications</div>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Applied</div>
            <div className="text-3xl font-bold text-blue-400">
              {stats.applied}
            </div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Shortlisted</div>
            <div className="text-3xl font-bold text-primary">
              {stats.shortlisted}
            </div>
          </div>
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Briefcase className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Offers</div>
            <div className="text-3xl font-bold text-green-400">
              {stats.offers}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="relative inline-block">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="TEST_SCHEDULED">Test Scheduled</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="OFFER">Offers</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : applications.length === 0 ? (
          <div className="glass-card border border-border/50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No applications yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start applying to placement drives to see them here
            </p>
            <Link
              href="/student/companies"
              className="inline-block px-6 py-3 gradient-primary text-white rounded-lg hover:opacity-90 transition-all font-medium"
            >
              Browse Companies
            </Link>
          </div>
        ) : (
          <div className="glass-card border border-border/50 rounded-xl overflow-x-auto">
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
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Applied On
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-card/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {application.drive.company.logo ? (
                          <img
                            src={application.drive.company.logo}
                            alt={application.drive.company.name}
                            className="w-10 h-10 object-contain rounded-lg border border-border/50"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {application.drive.company.name[0]}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {application.drive.company.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {application.drive.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {application.drive.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {application.drive.ctc
                          ? formatCurrency(application.drive.ctc)
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${
                          STATUS_COLORS[application.status] ||
                          "bg-muted/10 text-muted-foreground border-muted/20"
                        }`}
                      >
                        {STATUS_LABELS[application.status] || application.status}
                      </span>
                      {application.remarks && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {application.remarks}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(application.appliedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(application.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
