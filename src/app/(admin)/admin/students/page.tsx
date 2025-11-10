"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Upload, Search, Filter, UserPlus, X, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  email: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  applicationsCount: number;
  offersCount: number;
}

type SortField = 'rollNo' | 'name' | 'cgpa' | 'backlogs' | 'applicationsCount' | 'offersCount';
type SortOrder = 'asc' | 'desc';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; rollNo: string } | null>(null);
  const [formData, setFormData] = useState({
    rollNo: "",
    firstName: "",
    lastName: "",
    email: "",
    branch: "",
    cgpa: "",
    backlogs: "0",
    phone: "",
  });

  useEffect(() => {
    fetchStudents();
  }, [search, branch, page]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedStudents = () => {
    if (!sortField) return students;

    const sorted = [...students].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'rollNo':
          aValue = a.rollNo;
          bValue = b.rollNo;
          break;
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'cgpa':
          aValue = a.cgpa;
          bValue = b.cgpa;
          break;
        case 'backlogs':
          aValue = a.backlogs;
          bValue = b.backlogs;
          break;
        case 'applicationsCount':
          aValue = a.applicationsCount;
          bValue = b.applicationsCount;
          break;
        case 'offersCount':
          aValue = a.offersCount;
          bValue = b.offersCount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (branch) params.append("branch", branch);

      const response = await fetch(`/api/admin/students?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      // Fetch all students without pagination
      const response = await fetch(`/api/admin/students?limit=10000`);
      if (!response.ok) return;

      const data = await response.json();
      const allStudents = data.students;

      // Prepare data for Excel
      const excelData = allStudents.map((s: Student) => ({
        'Roll No': s.rollNo,
        'First Name': s.firstName,
        'Last Name': s.lastName,
        'Email': s.email,
        'Branch': s.branch,
        'CGPA': s.cgpa,
        'Backlogs': s.backlogs,
        'Phone': s.phone || '',
        'Active': s.isActive ? 'Yes' : 'No',
        'Applications': s.applicationsCount,
        'Offers': s.offersCount,
        'Last Login': s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : 'Never',
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');

      // Generate filename with timestamp
      const filename = `students_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/students/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cgpa: parseFloat(formData.cgpa),
          backlogs: parseInt(formData.backlogs),
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          rollNo: "",
          firstName: "",
          lastName: "",
          email: "",
          branch: "",
          cgpa: "",
          backlogs: "0",
          phone: "",
        });
        fetchStudents();
        setSuccessMessage("Student added successfully!");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        const data = await response.json();
        setSuccessMessage(data.error || "Failed to add student");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 4000);
      }
    } catch (error) {
      console.error("Error adding student:", error);
      setSuccessMessage("An error occurred while adding student");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStudent = async (studentId: string, rollNo: string) => {
    setDeleteTarget({ id: studentId, rollNo });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`/api/admin/students/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        fetchStudents();
        setSuccessMessage("Student deleted successfully");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        const data = await response.json();
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        setSuccessMessage(data.error || "Failed to delete student");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 4000);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      setSuccessMessage("An error occurred while deleting student");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    const Icon = isActive ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

    return (
      <th
        onClick={() => handleSort(field)}
        className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-card/50 transition-colors group select-none"
      >
        <div className="flex items-center gap-2">
          {children}
          <Icon className={`w-4 h-4 transition-all ${isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-60'}`} />
        </div>
      </th>
    );
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
                <Link href="/admin/students" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
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
              <Link
                href="/signout"
                className="px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all"
              >
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
              Student Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage student profiles and track placements
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-6 py-3 hover:bg-green-500/20 transition-all font-medium flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary/10 border border-primary/20 text-primary rounded-full px-6 py-3 hover:bg-primary/20 transition-all font-medium flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add Student
            </button>
            <Link
              href="/admin/students/import"
              className="gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all font-medium flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import Students
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, roll no, or email..."
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
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
              >
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-end">
              Total Students: <span className="font-semibold ml-2 text-foreground">{total}</span>
            </div>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : students.length === 0 ? (
          <div className="glass-card border border-border/50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No students found
            </h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? "Try adjusting your search filters"
                : "Import students to get started"}
            </p>
            <Link
              href="/admin/students/import"
              className="inline-block gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all"
            >
              Import Students
            </Link>
          </div>
        ) : (
          <>
            <div className="glass-card border border-border/50 rounded-xl overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <SortableHeader field="rollNo">Roll No</SortableHeader>
                    <SortableHeader field="name">Name</SortableHeader>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Branch
                    </th>
                    <SortableHeader field="cgpa">CGPA</SortableHeader>
                    <SortableHeader field="backlogs">Backlogs</SortableHeader>
                    <SortableHeader field="applicationsCount">Applications</SortableHeader>
                    <SortableHeader field="offersCount">Offers</SortableHeader>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sortedStudents().map((student) => (
                    <tr key={student.id} className="hover:bg-card/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium">
                          {student.branch}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {student.cgpa.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {student.backlogs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {student.applicationsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {student.offersCount > 0 ? (
                          <span className="text-green-400 font-semibold">
                            {student.offersCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.isActive ? (
                          <span className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs bg-muted/10 text-muted-foreground border border-muted/20 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => deleteStudent(student.id, student.rollNo)}
                            className="text-red-400 hover:text-red-300 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="glass-card border border-border/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Add New Student</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full px-4 py-2 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                    placeholder="e.g., 1BM21CS001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Branch *</label>
                  <select
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-2 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CGPA *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full px-4 py-2 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                    placeholder="8.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Backlogs *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.backlogs}
                    onChange={(e) => setFormData({ ...formData, backlogs: e.target.value })}
                    className="w-full px-4 py-2 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-card border border-border/50 text-foreground rounded-lg hover:border-border transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className="glass-card border border-border/50 rounded-xl p-4 shadow-2xl max-w-md">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                successMessage.includes("successfully")
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                {successMessage.includes("successfully") ? (
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
                  successMessage.includes("successfully") ? "text-green-400" : "text-red-400"
                }`}>
                  {successMessage.includes("successfully") ? "Success" : "Error"}
                </h4>
                <p className="text-sm text-muted-foreground">{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
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
                <h3 className="text-xl font-semibold text-foreground mb-2">Delete Student</h3>
                <p className="text-muted-foreground">
                  Are you sure you want to delete student <span className="font-semibold text-foreground">{deleteTarget.rollNo}</span>? This action cannot be undone and will permanently remove all associated data.
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
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
