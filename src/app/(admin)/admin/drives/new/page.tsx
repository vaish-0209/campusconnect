"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Briefcase, DollarSign, Calendar, GraduationCap } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

export default function CreateDrivePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyId: "",
    title: "",
    role: "",
    jobDescription: "",
    ctc: "",
    ctcBreakup: "",
    location: "",
    bond: "",
    techStack: "",
    minCgpa: "",
    maxBacklogs: "0",
    allowedBranches: [] as string[],
    registrationStart: "",
    registrationEnd: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleBranchToggle = (branch: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter((b) => b !== branch)
        : [...prev.allowedBranches, branch],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyId || !formData.title || !formData.role) {
      alert("Please fill all required fields");
      return;
    }

    if (
      new Date(formData.registrationEnd) <= new Date(formData.registrationStart)
    ) {
      alert("Registration end date must be after start date");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        companyId: formData.companyId,
        title: formData.title,
        role: formData.role,
        jobDescription: formData.jobDescription,
        ...(formData.ctc && { ctc: parseFloat(formData.ctc) }),
        ...(formData.ctcBreakup && { ctcBreakup: formData.ctcBreakup }),
        ...(formData.location && { location: formData.location }),
        ...(formData.bond && { bond: formData.bond }),
        techStack: formData.techStack
          ? formData.techStack.split(",").map((s) => s.trim())
          : [],
        ...(formData.minCgpa && { minCgpa: parseFloat(formData.minCgpa) }),
        maxBacklogs: parseInt(formData.maxBacklogs),
        allowedBranches: formData.allowedBranches,
        registrationStart: new Date(formData.registrationStart).toISOString(),
        registrationEnd: new Date(formData.registrationEnd).toISOString(),
      };

      const response = await fetch("/api/admin/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Drive created successfully!");
        router.push("/admin/drives");
      } else {
        alert(data.error || "Failed to create drive");
      }
    } catch (error) {
      console.error("Error creating drive:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const branches = ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/admin/drives" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Drives</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Create New Drive
          </h2>
          <p className="text-lg text-muted-foreground">
            Fill in the details to create a placement drive
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection */}
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Company Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Company *
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) =>
                    setFormData({ ...formData, companyId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Job Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Drive Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Software Engineer - Campus 2025"
                  required
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="e.g., Software Engineer, Data Analyst"
                  required
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Job Description *
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobDescription: e.target.value,
                    })
                  }
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    CTC (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ctc}
                    onChange={(e) =>
                      setFormData({ ...formData, ctc: e.target.value })
                    }
                    placeholder="e.g., 12.5"
                    className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Bangalore, Hyderabad"
                    className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  CTC Breakup
                </label>
                <input
                  type="text"
                  value={formData.ctcBreakup}
                  onChange={(e) =>
                    setFormData({ ...formData, ctcBreakup: e.target.value })
                  }
                  placeholder="e.g., Base: 10L, Bonus: 2L, Stocks: 0.5L"
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Bond Details
                </label>
                <input
                  type="text"
                  value={formData.bond}
                  onChange={(e) =>
                    setFormData({ ...formData, bond: e.target.value })
                  }
                  placeholder="e.g., 2 years service agreement"
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Tech Stack
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                  placeholder="e.g., React, Node.js, Python (comma-separated)"
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Eligibility Criteria
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.minCgpa}
                    onChange={(e) =>
                      setFormData({ ...formData, minCgpa: e.target.value })
                    }
                    placeholder="e.g., 7.5"
                    className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Max Backlogs Allowed
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxBacklogs}
                    onChange={(e) =>
                      setFormData({ ...formData, maxBacklogs: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Allowed Branches (leave empty for all branches)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {branches.map((branch) => (
                    <label
                      key={branch}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.allowedBranches.includes(branch)}
                        onChange={() => handleBranchToggle(branch)}
                        className="w-4 h-4 text-primary border-border/50 rounded focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-sm text-foreground">{branch}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Period */}
          <div className="glass-card border border-border/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Registration Period
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.registrationStart}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationStart: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.registrationEnd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationEnd: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/drives"
              className="px-6 py-3 bg-card border border-border/50 text-foreground rounded-full hover:border-primary/30 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 gradient-primary text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              {loading ? "Creating..." : "Create Drive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
