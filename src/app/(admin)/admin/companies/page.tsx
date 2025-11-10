"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Building2, Plus, ExternalLink, X, Upload } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo: string | null;
  sector: string;
  website: string | null;
  description: string | null;
  packageRange: string | null;
  eligibilityMinCGPA: number | null;
  eligibilityMaxBacklogs: number | null;
  eligibilityBranches: string | null;
  hrContactName: string | null;
  hrContactEmail: string | null;
  hrContactPhone: string | null;
  drivesCount: number;
  totalApplications: number;
  totalOffers: number;
  createdAt: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    sector: "",
    website: "",
    description: "",
    packageRange: "",
    eligibilityMinCGPA: "",
    eligibilityMaxBacklogs: "",
    eligibilityBranches: "",
    hrContactName: "",
    hrContactEmail: "",
    hrContactPhone: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      logo: "",
      sector: "",
      website: "",
      description: "",
      packageRange: "",
      eligibilityMinCGPA: "",
      eligibilityMaxBacklogs: "",
      eligibilityBranches: "",
      hrContactName: "",
      hrContactEmail: "",
      hrContactPhone: "",
    });
    setLogoFile(null);
    setLogoPreview("");
    setShowModal(true);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      logo: company.logo || "",
      sector: company.sector,
      website: company.website || "",
      description: company.description || "",
      packageRange: company.packageRange || "",
      eligibilityMinCGPA: company.eligibilityMinCGPA?.toString() || "",
      eligibilityMaxBacklogs: company.eligibilityMaxBacklogs?.toString() || "",
      eligibilityBranches: company.eligibilityBranches || "",
      hrContactName: company.hrContactName || "",
      hrContactEmail: company.hrContactEmail || "",
      hrContactPhone: company.hrContactPhone || "",
    });
    setLogoFile(null);
    setLogoPreview(company.logo || "");
    setShowModal(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (msg: string) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCompany
        ? `/api/admin/companies/${editingCompany.id}`
        : "/api/admin/companies";

      const payload = {
        ...formData,
        logo: logoPreview || formData.logo,
        eligibilityMinCGPA: formData.eligibilityMinCGPA ? parseFloat(formData.eligibilityMinCGPA) : undefined,
        eligibilityMaxBacklogs: formData.eligibilityMaxBacklogs ? parseInt(formData.eligibilityMaxBacklogs) : undefined,
      };

      const response = await fetch(url, {
        method: editingCompany ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        fetchCompanies();
        showToast("Company saved successfully");
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to save company");
      }
    } catch (error) {
      showToast("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`/api/admin/companies/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        fetchCompanies();
        showToast("Company deleted successfully");
      } else {
        const error = await response.json();
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        showToast(error.error || "Failed to delete company");
      }
    } catch (error) {
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      showToast("An error occurred");
    }
  };

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
                <Link href="/admin/companies" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
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
              Company Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage companies and view their placement drives
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Company
          </button>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : companies.length === 0 ? (
          <div className="glass-card border border-border/50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No companies yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Add companies to start creating placement drives
            </p>
            <button
              onClick={openCreateModal}
              className="inline-block gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all"
            >
              Add First Company
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="glass-card border border-border/50 rounded-xl hover:border-primary/30 transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  {company.logo ? (
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-white/95 p-3 shadow-sm">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                      <span className="text-2xl font-bold text-primary">
                        {company.name[0]}
                      </span>
                    </div>
                  )}
                  {company.packageRange && (
                    <span className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-medium">
                      {company.packageRange}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {company.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{company.sector}</p>

                {company.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {company.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-border/50">
                  <Link
                    href={`/admin/drives?company=${encodeURIComponent(company.name)}`}
                    className="text-center hover:bg-primary/5 rounded-lg p-3 transition-colors"
                  >
                    <div className="text-2xl font-semibold text-primary">
                      {company.drivesCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Active Drives</div>
                  </Link>
                  <div className="text-center p-3">
                    <div className="text-2xl font-semibold text-green-400">
                      {company.totalOffers}
                    </div>
                    <div className="text-xs text-muted-foreground">Offers Made</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => openEditModal(company)}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id, company.name)}
                    className="text-sm text-red-400 hover:text-red-300 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md p-4">
            <div className="glass-card border border-border/50 rounded-xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                {editingCompany ? "Edit Company" : "Add New Company"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Sector *
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) =>
                        setFormData({ ...formData, sector: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                    >
                      <option value="">Select Sector</option>
                      <option value="IT">IT</option>
                      <option value="Core">Core</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Finance">Finance</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Package Range
                    </label>
                    <input
                      type="text"
                      value={formData.packageRange}
                      onChange={(e) =>
                        setFormData({ ...formData, packageRange: e.target.value })
                      }
                      placeholder="e.g., 12-15 LPA"
                      className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    placeholder="Brief company description..."
                    className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-3">
                      {logoPreview && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-card border border-border/50">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full px-4 py-3 bg-card border border-border/50 text-muted-foreground rounded-lg hover:border-primary/50 transition-colors flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">
                            {logoFile ? logoFile.name : "Upload logo image"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                    />
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Eligibility Criteria</h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Min CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.eligibilityMinCGPA}
                        onChange={(e) =>
                          setFormData({ ...formData, eligibilityMinCGPA: e.target.value })
                        }
                        placeholder="e.g., 7.0"
                        className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Max Backlogs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.eligibilityMaxBacklogs}
                        onChange={(e) =>
                          setFormData({ ...formData, eligibilityMaxBacklogs: e.target.value })
                        }
                        placeholder="e.g., 0"
                        className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Allowed Branches
                    </label>
                    <input
                      type="text"
                      value={formData.eligibilityBranches}
                      onChange={(e) =>
                        setFormData({ ...formData, eligibilityBranches: e.target.value })
                      }
                      placeholder="e.g., CSE, IT, ECE"
                      className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                    />
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">HR Contact</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        HR Name
                      </label>
                      <input
                        type="text"
                        value={formData.hrContactName}
                        onChange={(e) =>
                          setFormData({ ...formData, hrContactName: e.target.value })
                        }
                        placeholder="Contact person name"
                        className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          HR Email
                        </label>
                        <input
                          type="email"
                          value={formData.hrContactEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, hrContactEmail: e.target.value })
                          }
                          placeholder="hr@company.com"
                          className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          HR Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.hrContactPhone}
                          onChange={(e) =>
                            setFormData({ ...formData, hrContactPhone: e.target.value })
                          }
                          placeholder="+91 9876543210"
                          className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4 sticky bottom-0 bg-card">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-card border border-border/50 text-foreground rounded-full hover:border-primary/30 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 gradient-primary text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {submitting ? "Saving..." : "Save Company"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
            <div className="glass-card border border-border/50 rounded-xl p-4 shadow-2xl max-w-md">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.includes("successfully")
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}>
                  {message.includes("successfully") ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    message.includes("successfully") ? "text-green-400" : "text-red-400"
                  }`}>
                    {message.includes("successfully") ? "Success" : "Error"}
                  </h4>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>
                <button
                  onClick={() => setShowMessage(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && deleteTarget && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card border border-border/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Delete Company</h3>
                  <p className="text-muted-foreground">
                    Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteTarget(null);
                  }}
                  className="px-6 py-2.5 bg-card border border-border/50 text-foreground rounded-lg hover:border-border transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all font-medium"
                >
                  Delete Company
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
