"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatCard } from "@/components/ui/stat-card";
import { Users, CheckCircle, Building2, Zap, Award } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCompanies: number;
  activeDrives: number;
  placedStudents: number;
  recentApplications: Array<{
    id: string;
    studentName: string;
    companyName: string;
    status: string;
    appliedAt: string;
  }>;
  upcomingDrives: Array<{
    id: string;
    companyName: string;
    role: string;
    deadline: string;
  }>;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  const placementRate = stats?.totalStudents
    ? ((stats.placedStudents / stats.totalStudents) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Top Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-foreground tracking-wide">
                Campus<span className="text-primary">Connect</span>
              </h1>
              <div className="flex items-center gap-2">
                <Link href="/admin/dashboard" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
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
                <Link href="/admin/events" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Events
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/analytics" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                Analytics
              </Link>
              <span className="text-sm text-muted-foreground">{session?.user?.name}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Welcome back, {session?.user?.name?.split(" ")[0]}
          </h2>
          <p className="text-lg text-muted-foreground">Here's what's happening with your placements today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={Users}
            iconColor="text-primary"
            href="/admin/students"
          />
          <StatCard
            title="Active Drives"
            value={stats?.activeDrives || 0}
            icon={Zap}
            iconColor="text-orange-400"
            href="/admin/drives"
          />
          <StatCard
            title="Companies"
            value={stats?.totalCompanies || 0}
            icon={Building2}
            iconColor="text-blue-400"
            href="/admin/companies"
          />
          <StatCard
            title="Placement Rate"
            value={`${placementRate}%`}
            icon={Award}
            iconColor="text-green-400"
            change={stats?.placedStudents ? `${stats.placedStudents} placed` : undefined}
            changeType="positive"
            href="/admin/analytics"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/students/import" className="glass-card border border-border/50 rounded-xl px-6 py-5 hover:border-primary/30 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Import Students</span>
            </Link>
            <Link href="/admin/companies/add" className="glass-card border border-border/50 rounded-xl px-6 py-5 hover:border-primary/30 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Add Company</span>
            </Link>
            <Link href="/admin/drives/new" className="glass-card border border-border/50 rounded-xl px-6 py-5 hover:border-primary/30 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/20 transition-all">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Create Drive</span>
            </Link>
            <Link href="/admin/analytics" className="glass-card border border-border/50 rounded-xl px-6 py-5 hover:border-primary/30 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                <Award className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-foreground">View Analytics</span>
            </Link>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Recent Applications</h3>
            <div className="space-y-3">
              {stats?.recentApplications && stats.recentApplications.length > 0 ? (
                stats.recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all bg-card/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{app.studentName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{app.companyName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === "OFFER" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                      app.status === "REJECTED" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-primary/10 text-primary border border-primary/20"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No recent applications</p>
              )}
            </div>
          </div>

          {/* Upcoming Drives */}
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Upcoming Drives</h3>
            <div className="space-y-3">
              {stats?.upcomingDrives && stats.upcomingDrives.length > 0 ? (
                stats.upcomingDrives.map((drive) => (
                  <Link
                    key={drive.id}
                    href={`/admin/drives/${drive.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all bg-card/30 group"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{drive.companyName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{drive.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="text-xs font-medium text-foreground mt-1">
                        {new Date(drive.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No upcoming drives</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
