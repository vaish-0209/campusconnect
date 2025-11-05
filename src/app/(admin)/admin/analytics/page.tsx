"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Users, Building2, Award, Download, Calendar } from "lucide-react";

interface AnalyticsData {
  overview: {
    totalStudents: number;
    placedStudents: number;
    placementPercentage: number;
    totalDrives: number;
    totalApplications: number;
    totalOffers: number;
  };
  ctcStatistics: {
    averageCTC: number;
    medianCTC: number;
    highestCTC: number;
    lowestCTC: number;
  };
  branchWise: Array<{
    branch: string;
    totalStudents: number;
    placedStudents: number;
    placementPercentage: number;
    averageCTC: number;
    offersCount: number;
  }>;
  topRecruiters: Array<{
    companyName: string;
    offersCount: number;
    averageCTC: number;
    highestCTC: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch("/api/admin/analytics?format=csv");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placement-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
  const placementRate = data?.overview.placementPercentage?.toFixed(1) || "0";

  // Transform branchWise data for charts
  const branchChartData = data?.branchWise.map(b => ({
    branch: b.branch,
    total: b.totalStudents,
    placed: b.placedStudents,
    percentage: b.placementPercentage
  })) || [];

  // Create CTC distribution from offers
  const ctcRanges = [
    { range: "0-5 LPA", min: 0, max: 5 },
    { range: "5-10 LPA", min: 5, max: 10 },
    { range: "10-15 LPA", min: 10, max: 15 },
    { range: "15+ LPA", min: 15, max: 999 }
  ];

  const ctcDistribution = ctcRanges.map(range => ({
    range: range.range,
    count: data?.topRecruiters.reduce((count, recruiter) => {
      if (recruiter.averageCTC >= range.min && recruiter.averageCTC < range.max) {
        return count + recruiter.offersCount;
      }
      return count;
    }, 0) || 0
  })).filter(d => d.count > 0) || [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

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
            <div>
              
                <button onClick={() => signOut({ callbackUrl: "/login" })}  className="px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all">
                  Logout
                </button>
              
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Placement Analytics
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive insights and statistics
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all font-medium flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Award className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Placement Rate</p>
            <p className="text-3xl font-bold text-foreground">{placementRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.overview.placedStudents} / {data?.overview.totalStudents} students
            </p>
          </div>

          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Average CTC</p>
            <p className="text-3xl font-bold text-foreground">
              ₹{(data?.ctcStatistics?.averageCTC || 0).toFixed(2)}L
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Median: ₹{(data?.ctcStatistics?.medianCTC || 0).toFixed(2)}L
            </p>
          </div>

          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Highest CTC</p>
            <p className="text-3xl font-bold text-foreground">
              ₹{(data?.ctcStatistics?.highestCTC || 0).toFixed(2)}L
            </p>
            <p className="text-xs text-muted-foreground mt-1">Top offer</p>
          </div>

          <div className="glass-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Offers</p>
            <p className="text-3xl font-bold text-foreground">
              {data?.overview.totalOffers || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From {data?.topRecruiters?.length || 0} companies
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Branch-wise Placements */}
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Branch-wise Placements</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30303d" />
                <XAxis dataKey="branch" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a24",
                    border: "1px solid #30303d",
                    borderRadius: "8px",
                    color: "#f2f2f2",
                  }}
                />
                <Legend />
                <Bar dataKey="total" fill="#6366f1" name="Total Students" />
                <Bar dataKey="placed" fill="#8b5cf6" name="Placed Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CTC Distribution */}
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">CTC Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ctcDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percent }: any) => `${range}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ctcDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a24",
                    border: "1px solid #30303d",
                    borderRadius: "8px",
                  }}
                  itemStyle={{
                    color: "#f2f2f2",
                  }}
                  labelStyle={{
                    color: "#f2f2f2",
                  }}
                  formatter={(value: any, name: any, props: any) => {
                    return [`${value} offers`, props.payload.range];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Application Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.statusDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30303d" />
              <XAxis dataKey="status" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a24",
                  border: "1px solid #30303d",
                  borderRadius: "8px",
                  color: "#f2f2f2",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Companies */}
        <div className="glass-card border border-border/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Top Recruiting Companies</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-card/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Offers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Average CTC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Highest CTC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(data?.topRecruiters || []).map((company, idx) => (
                  <tr key={idx} className="hover:bg-card/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {company.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium">
                        {company.offersCount} offers
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ₹{company.averageCTC.toFixed(2)}L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ₹{company.highestCTC.toFixed(2)}L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
