"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Calendar, IndianRupee, Users, GraduationCap, AlertCircle, CheckCircle } from "lucide-react";

interface Drive {
  id: string;
  title: string;
  role: string;
  jobDescription: string;
  ctc: number | null;
  ctcBreakup: string | null;
  location: string | null;
  bond: string | null;
  techStack: string | null;
  positionsAvailable: number | null;
  minCgpa: number | null;
  maxBacklogs: number;
  allowedBranches: string[];
  registrationStart: string;
  registrationEnd: string;
  isActive: boolean;
  company: {
    name: string;
    logo: string | null;
    sector: string | null;
  };
  isEligible: boolean;
  hasApplied: boolean;
  applicationStatus?: string;
}

export default function DriveDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [drive, setDrive] = useState<Drive | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriveDetails();
  }, [params.id]);

  const fetchDriveDetails = async () => {
    try {
      const response = await fetch(`/api/student/drives/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDrive(data);
      }
    } catch (error) {
      console.error("Error fetching drive details:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyToDrive = async () => {
    if (!drive) return;

    try {
      const response = await fetch("/api/student/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveId: drive.id }),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        fetchDriveDetails();
      } else {
        const error = await response.json();
        alert(error.error || error.message || "Failed to apply");
      }
    } catch (error) {
      console.error("Application error:", error);
      alert("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Drive not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Drives
          </button>
          <div className="flex items-start gap-4">
            {drive.company.logo ? (
              <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src={drive.company.logo}
                  alt={drive.company.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1">{drive.title}</h1>
              <p className="text-lg text-muted-foreground mb-2">{drive.company.name}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {drive.role && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-purple-400" />
                    {drive.role}
                  </span>
                )}
                {drive.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    {drive.location}
                  </span>
                )}
                {drive.ctc && (
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-purple-400" />
                    ₹{drive.ctc} LPA
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Eligibility Status */}
            {!drive.isEligible && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive mb-1">You are not eligible for this drive</p>
                  <p className="text-sm text-destructive/80">Please check the eligibility criteria below</p>
                </div>
              </div>
            )}

            {drive.hasApplied && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-400 mb-1">Application Submitted</p>
                  <p className="text-sm text-green-400/80">
                    Status: <span className="font-medium">{drive.applicationStatus}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Job Description */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Job Description</h2>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {drive.jobDescription}
                </p>
              </div>
            </div>

            {/* Required Skills */}
            {drive.techStack && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Required Skills</h2>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex flex-wrap gap-2">
                    {drive.techStack.split(',').map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CTC Breakup */}
            {drive.ctcBreakup && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">CTC Breakup</h2>
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-muted-foreground whitespace-pre-line">{drive.ctcBreakup}</p>
                </div>
              </div>
            )}

            {/* Bond Information */}
            {drive.bond && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Bond/Service Agreement</h2>
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-muted-foreground whitespace-pre-line">{drive.bond}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Quick Info</h3>

              {drive.positionsAvailable && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Positions Available</p>
                  <p className="text-sm font-semibold text-foreground">{drive.positionsAvailable}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1">Application Deadline</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(drive.registrationEnd).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {drive.company.sector && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sector</p>
                  <p className="text-sm font-semibold text-foreground">{drive.company.sector}</p>
                </div>
              )}
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Eligibility Criteria</h3>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Minimum CGPA</p>
                <p className="text-sm font-semibold text-foreground">{drive.minCgpa || "No Minimum"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Maximum Backlogs</p>
                <p className="text-sm font-semibold text-foreground">{drive.maxBacklogs}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Allowed Branches</p>
                <p className="text-sm font-semibold text-foreground">
                  {drive.allowedBranches.length > 0 ? drive.allowedBranches.join(", ") : "All Branches"}
                </p>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={applyToDrive}
              disabled={!drive.isEligible || drive.hasApplied}
              className={`w-full py-4 rounded-lg font-semibold text-center transition-all ${
                drive.hasApplied
                  ? "bg-green-500/20 text-green-400 cursor-not-allowed"
                  : !drive.isEligible
                  ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              }`}
            >
              {drive.hasApplied ? "Already Applied" : !drive.isEligible ? "Not Eligible" : "Apply Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
