"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ArrowLeft, Building2, MapPin, Calendar, Briefcase, CheckCircle,
  XCircle, AlertCircle, Clock, Code, Award, Users
} from "lucide-react";

interface DriveDetail {
  id: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    sector: string;
    tier: string | null;
    website: string | null;
  };
  title: string;
  role: string;
  jobDescription: string;
  ctc: number | null;
  ctcBreakup: string | null;
  location: string | null;
  bond: string | null;
  techStack: string[];
  minCgpa: number | null;
  maxBacklogs: number;
  allowedBranches: string[];
  registrationStart: string;
  registrationEnd: string;
  events: Array<{
    id: string;
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    venue: string | null;
    meetingLink: string | null;
  }>;
  eligibility: {
    isEligible: boolean;
    reasons: string[];
  };
  application: {
    id: string;
    status: string;
    appliedAt: string;
  } | null;
}

export default function DriveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [drive, setDrive] = useState<DriveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDrive();
    }
  }, [params.id]);

  const fetchDrive = async () => {
    try {
      const response = await fetch(`/api/student/drives/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDrive(data);
      } else {
        router.push("/student/companies");
      }
    } catch (error) {
      console.error("Error fetching drive:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!drive) return;

    setApplying(true);
    try {
      const response = await fetch("/api/student/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveId: drive.id }),
      });

      if (response.ok) {
        // Refresh drive data
        await fetchDrive();
        alert("Application submitted successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying:", error);
      alert("An error occurred");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!drive) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/student/companies" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" />
              Back to Companies
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Company Header */}
        <div className="glass-card border border-border/50 rounded-xl p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {drive.company.logo ? (
                <img
                  src={drive.company.logo}
                  alt={drive.company.name}
                  className="w-24 h-24 object-contain rounded-lg border border-border/50"
                />
              ) : (
                <div className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {drive.company.name[0]}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {drive.company.name}
                  </h1>
                  {drive.company.tier && (
                    <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20 rounded-full">
                      {drive.company.tier}
                    </span>
                  )}
                </div>
                <p className="text-xl text-foreground/90 mb-2">{drive.title}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {drive.company.sector}
                  </span>
                  {drive.company.website && (
                    <a
                      href={drive.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Status */}
        {drive.application ? (
          <div className="glass-card border border-green-500/20 bg-green-500/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Application Submitted
                </h3>
                <p className="text-sm text-green-400/80 mt-1">
                  Status: <span className="font-medium">{drive.application.status}</span>
                </p>
                <p className="text-sm text-green-400/80">
                  Applied on: {formatDateTime(drive.application.appliedAt)}
                </p>
              </div>
              <Link
                href="/student/applications"
                className="px-5 py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all font-medium"
              >
                View Application
              </Link>
            </div>
          </div>
        ) : !drive.eligibility.isEligible ? (
          <div className="glass-card border border-red-500/20 bg-red-500/10 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Not Eligible
            </h3>
            <ul className="text-sm text-red-400/80 space-y-1.5">
              {drive.eligibility.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="glass-card border border-primary/20 bg-primary/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  You are eligible for this drive!
                </h3>
                <p className="text-sm text-primary/80 mt-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Registration closes: {formatDate(drive.registrationEnd)}
                </p>
              </div>
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-6 py-3 gradient-primary text-white rounded-lg hover:opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>
            </div>
          </div>
        )}

        {/* Job Details */}
        <div className="glass-card border border-border/50 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Job Details
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Award className="w-4 h-4" />
                Role
              </div>
              <div className="font-semibold text-foreground">{drive.role}</div>
            </div>
            {drive.ctc && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">CTC</div>
                <div className="font-semibold text-foreground">
                  {formatCurrency(drive.ctc)}
                </div>
              </div>
            )}
            {drive.location && (
              <div>
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
                <div className="font-semibold text-foreground">{drive.location}</div>
              </div>
            )}
            {drive.bond && (
              <div>
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Bond
                </div>
                <div className="font-semibold text-foreground">{drive.bond}</div>
              </div>
            )}
          </div>

          {drive.ctcBreakup && (
            <div className="mb-8 p-4 bg-card border border-border/50 rounded-lg">
              <div className="text-sm font-semibold text-foreground mb-2">CTC Breakup</div>
              <div className="text-muted-foreground whitespace-pre-line text-sm">
                {drive.ctcBreakup}
              </div>
            </div>
          )}

          {drive.techStack.length > 0 && (
            <div className="mb-8">
              <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
                <Code className="w-4 h-4" />
                Tech Stack
              </div>
              <div className="flex flex-wrap gap-2">
                {drive.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-semibold text-foreground mb-3">Job Description</div>
            <div className="prose max-w-none text-muted-foreground">
              {drive.jobDescription.split('\n').map((para, idx) => (
                <p key={idx} className="mb-2">{para}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="glass-card border border-border/50 rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            Eligibility Criteria
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {drive.minCgpa && (
              <div className="p-4 bg-card border border-border/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Minimum CGPA</div>
                <div className="font-semibold text-foreground text-xl">
                  {drive.minCgpa}
                </div>
              </div>
            )}
            <div className="p-4 bg-card border border-border/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Maximum Backlogs</div>
              <div className="font-semibold text-foreground text-xl">
                {drive.maxBacklogs}
              </div>
            </div>
            {drive.allowedBranches.length > 0 && (
              <div className="p-4 bg-card border border-border/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Allowed Branches
                </div>
                <div className="font-semibold text-foreground">
                  {drive.allowedBranches.join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Events */}
        {drive.events.length > 0 && (
          <div className="glass-card border border-border/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Scheduled Events
            </h2>

            <div className="space-y-4">
              {drive.events.map((event) => (
                <div
                  key={event.id}
                  className="glass-card border border-border/50 rounded-lg p-5 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(event.startTime)}
                      </p>
                      {event.venue && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </p>
                      )}
                      {event.meetingLink && (
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1 mt-2"
                        >
                          Join Meeting →
                        </a>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-medium">
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
