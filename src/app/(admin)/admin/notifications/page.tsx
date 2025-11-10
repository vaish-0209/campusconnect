"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, Send, Users, Building2, Zap, CheckCircle } from "lucide-react";

export default function AdminNotificationsPage() {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target: "ALL",
    targetIds: [] as string[],
    priority: "MEDIUM",
  });
  const [students, setStudents] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchDrives();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          title: "",
          message: "",
          target: "ALL",
          targetIds: [],
          priority: "MEDIUM",
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send notification");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setSending(false);
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
              
                <Link href="/signout" className="px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all">
                  Logout
                </Link>
              
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Broadcast Notifications
          </h2>
          <p className="text-lg text-muted-foreground">
            Send announcements to students
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 animate-slide-down">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-sm text-green-400">Notification sent successfully!</p>
          </div>
        )}

        {/* Broadcast Form */}
        <div className="glass-card border border-border/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notification Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., New Drive Announced"
                className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Target Audience</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value, targetIds: [] })}
                className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
              >
                <option value="ALL">All Students</option>
                <option value="BRANCH">By Branch</option>
                <option value="DRIVE">By Drive</option>
                <option value="CUSTOM">Custom Selection</option>
              </select>
            </div>

            {formData.target === "BRANCH" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Branch</label>
                <select
                  onChange={(e) => setFormData({ ...formData, targetIds: [e.target.value] })}
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                >
                  <option value="">Choose a branch</option>
                  <option value="CSE">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="MECH">Mechanical</option>
                  <option value="CIVIL">Civil</option>
                </select>
              </div>
            )}

            {formData.target === "DRIVE" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Drive</label>
                <select
                  onChange={(e) => setFormData({ ...formData, targetIds: [e.target.value] })}
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                >
                  <option value="">Choose a drive</option>
                  {drives.map((drive) => (
                    <option key={drive.id} value={drive.id}>
                      {drive.company.name} - {drive.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.target === "CUSTOM" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Students</label>
                <div className="max-h-64 overflow-y-auto bg-card border border-border/50 rounded-lg p-4 space-y-2">
                  {students.map((student) => (
                    <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-secondary/30 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetIds.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              targetIds: [...formData.targetIds, student.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              targetIds: formData.targetIds.filter((id) => id !== student.id),
                            });
                          }
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">
                        {student.firstName} {student.lastName} ({student.rollNo}) - {student.branch}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
              <div className="flex gap-4">
                {["LOW", "MEDIUM", "HIGH"].map((priority) => (
                  <label key={priority} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-foreground">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <div className="flex-1 text-sm text-muted-foreground">
                {formData.target === "ALL" && `Sending to all ${students.length} students`}
                {formData.target === "CUSTOM" && `Sending to ${formData.targetIds.length} selected student(s)`}
                {formData.target === "BRANCH" && formData.targetIds.length > 0 && `Sending to ${formData.targetIds[0]} students`}
                {formData.target === "DRIVE" && formData.targetIds.length > 0 && `Sending to drive applicants`}
              </div>
              <button
                type="submit"
                disabled={sending || (formData.target !== "ALL" && formData.targetIds.length === 0)}
                className="gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Templates */}
        <div className="mt-8 glass-card border border-border/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  title: "New Drive Announced",
                  message: "A new placement drive has been announced. Check the Drives section for details and register before the deadline.",
                })
              }
              className="p-4 bg-card border border-border/50 rounded-lg hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">New Drive</span>
              </div>
              <p className="text-xs text-muted-foreground">Announce a new placement opportunity</p>
            </button>

            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  title: "Deadline Reminder",
                  message: "This is a reminder that the registration deadline for [Drive Name] is approaching. Please complete your application soon.",
                })
              }
              className="p-4 bg-card border border-border/50 rounded-lg hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-foreground">Deadline Reminder</span>
              </div>
              <p className="text-xs text-muted-foreground">Remind students about deadlines</p>
            </button>

            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  title: "Results Announced",
                  message: "Results for [Drive/Test Name] have been announced. Check your dashboard to see your status.",
                })
              }
              className="p-4 bg-card border border-border/50 rounded-lg hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium text-foreground">Results</span>
              </div>
              <p className="text-xs text-muted-foreground">Notify about test/interview results</p>
            </button>

            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  title: "Important Announcement",
                  message: "There is an important update regarding placements. Please check the dashboard for more information.",
                })
              }
              className="p-4 bg-card border border-border/50 rounded-lg hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-foreground">General Update</span>
              </div>
              <p className="text-xs text-muted-foreground">General announcements</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
