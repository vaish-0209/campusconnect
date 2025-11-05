"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { User, Mail, Phone, GraduationCap, Award, Code, Save, Edit2, CheckCircle, Camera, FileText, Upload, X } from "lucide-react";
import { StudentNavbar } from "@/components/student/StudentNavbar";

interface StudentProfile {
  id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  branch: string;
  cgpa: number;
  backlogs: number;
  skills: string | null;
  resume: string | null;
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;
  profileImage: string | null;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    skills: "",
    github: "",
    linkedin: "",
    portfolio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.student);
        setProfileImage(data.student.profileImage);
        setResume(data.student.resume);
        if (data.student.resume) {
          setResumeFileName("Current Resume");
        }
        setFormData({
          phone: data.student.phone || "",
          skills: data.student.skills || "",
          github: data.student.github || "",
          linkedin: data.student.linkedin || "",
          portfolio: data.student.portfolio || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'profile_photos');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || 'Failed to upload image');
          return;
        }

        const data = await response.json();
        setProfileImage(data.url);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image');
      }
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Resume size should be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF or DOCX file");
        return;
      }

      try {
        setResumeFileName(file.name);

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'resumes');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || 'Failed to upload resume');
          setResumeFileName(null);
          return;
        }

        const data = await response.json();
        setResume(data.url);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload resume');
        setResumeFileName(null);
      }
    }
  };

  const removeResume = () => {
    setResume(null);
    setResumeFileName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileImage: profileImage,
          resume: resume,
        }),
      });

      if (response.ok) {
        await fetchProfile();
        setEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      <StudentNavbar />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              My Profile
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage your personal information
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="gradient-primary text-white rounded-full px-6 py-3 hover:opacity-90 transition-all font-medium flex items-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="glass-card border border-border/50 rounded-2xl p-8 mb-8">
          {/* Header */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border/50">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:opacity-90 transition-all shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-muted-foreground">{profile.rollNo} • {profile.branch}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Python, Java, React, ..."
                    className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-3 bg-card border border-border/50 text-foreground rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resume
                </label>
                {resume ? (
                  <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="flex-1 text-foreground text-sm">{resumeFileName}</span>
                    <button
                      type="button"
                      onClick={removeResume}
                      className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-card hover:bg-secondary/20 transition-all">
                    <Upload className="w-8 h-8 mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Upload Resume (PDF or DOCX)</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc"
                      onChange={handleResumeUpload}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      phone: profile.phone || "",
                      skills: profile.skills || "",
                      github: profile.github || "",
                      linkedin: profile.linkedin || "",
                      portfolio: profile.portfolio || "",
                    });
                  }}
                  className="flex-1 bg-card border border-border/50 text-foreground py-3 rounded-lg font-semibold hover:bg-secondary/50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground font-medium">{profile.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">CGPA</p>
                    <p className="text-foreground font-medium">{profile.cgpa.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Backlogs</p>
                    <p className="text-foreground font-medium">{profile.backlogs}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="pt-6 border-t border-border/50">
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">Skills</p>
                    <p className="text-foreground">{profile.skills || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Links */}
              {(profile.github || profile.linkedin || profile.portfolio) && (
                <div className="pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-3">Links</p>
                  <div className="space-y-2">
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                        GitHub: {profile.github}
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                        LinkedIn: {profile.linkedin}
                      </a>
                    )}
                    {profile.portfolio && (
                      <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                        Portfolio: {profile.portfolio}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Completion */}
        <div className="glass-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Profile Completion</h3>
            <span className="text-2xl font-bold text-primary">
              {Math.round(
                (([profile.phone, profile.skills, profile.github, profile.linkedin].filter(Boolean).length) / 4) * 100
              )}%
            </span>
          </div>
          <div className="w-full bg-card rounded-full h-3 overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-500"
              style={{
                width: `${(([profile.phone, profile.skills, profile.github, profile.linkedin].filter(Boolean).length) / 4) * 100}%`,
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: "Phone Number", completed: !!profile.phone },
              { label: "Skills", completed: !!profile.skills },
              { label: "GitHub Profile", completed: !!profile.github },
              { label: "LinkedIn Profile", completed: !!profile.linkedin },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                {item.completed ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
