"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Target,
  Briefcase,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Award,
} from "lucide-react";
import { StudentNavbar } from "@/components/student/StudentNavbar";

interface RecommendedDrive {
  id: string;
  title: string;
  role: string;
  company: {
    name: string;
    logo: string | null;
    sector: string;
  };
  ctc: number | null;
  registrationEnd: string;
  matchScore: number;
  matchReasons: string[];
  eligibility: {
    isEligible: boolean;
    reasons: string[];
  };
}

interface Insights {
  eligibleCount: number;
  topSectors: string[];
  skillGaps: string[];
  suggestions: string[];
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendedDrive[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalDrives: 0, unappliedDrives: 0 });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/recommendations");
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setInsights(data.insights || null);
        setStats({
          totalDrives: data.totalDrives || 0,
          unappliedDrives: data.unappliedDrives || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-orange-400";
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/30 text-green-400";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
    return "bg-orange-500/20 border-orange-500/30 text-orange-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />

      <main className="container px-4 py-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-xs">Total Drives</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalDrives}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">Eligible</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{insights?.eligibleCount || 0}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Not Applied</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{stats.unappliedDrives}</p>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Top Recommendations for You
                </h2>
                {recommendations.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No recommendations available. Check back later for new drives!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((drive) => (
                      <div
                        key={drive.id}
                        className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            {drive.company.logo ? (
                              <img
                                src={drive.company.logo}
                                alt={drive.company.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-primary" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{drive.company.name}</h3>
                              <p className="text-muted-foreground">{drive.role}</p>
                            </div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-full border font-semibold ${getMatchBadgeColor(
                              drive.matchScore
                            )}`}
                          >
                            {drive.matchScore}% Match
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="mb-4 space-y-2">
                          {drive.matchReasons.map((reason, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span className="text-muted-foreground">{reason}</span>
                            </div>
                          ))}
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          {drive.ctc && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>₹{drive.ctc}L</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Deadline:{" "}
                              {new Date(drive.registrationEnd).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Eligibility Status */}
                        <div
                          className={`p-3 rounded-lg border ${
                            drive.eligibility.isEligible
                              ? "bg-green-500/10 border-green-500/20"
                              : "bg-orange-500/10 border-orange-500/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {drive.eligibility.isEligible ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-semibold text-green-400">
                                  Eligible
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                <span className="text-sm font-semibold text-orange-400">
                                  Not Eligible
                                </span>
                              </>
                            )}
                          </div>
                          {drive.eligibility.reasons.map((reason, index) => (
                            <p key={index} className="text-xs text-muted-foreground">
                              {reason}
                            </p>
                          ))}
                        </div>

                        {/* Action Button */}
                        <Link
                          href={`/student/drives`}
                          className="mt-4 w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                          View Details & Apply
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Insights */}
              {insights && (
                <>
                  {/* Top Sectors */}
                  {insights.topSectors.length > 0 && (
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Your Top Sectors
                      </h3>
                      <div className="space-y-2">
                        {insights.topSectors.map((sector, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 bg-secondary/50 rounded-lg text-sm"
                          >
                            {sector}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Gaps */}
                  {insights.skillGaps.length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-orange-400">
                        <Target className="w-5 h-5" />
                        Skill Gaps
                      </h3>
                      <div className="space-y-2">
                        {insights.skillGaps.map((skill, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 bg-background/50 rounded-lg text-sm capitalize"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {insights.suggestions.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-400">
                        <Lightbulb className="w-5 h-5" />
                        Suggestions
                      </h3>
                      <ul className="space-y-3">
                        {insights.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-400 mt-1">→</span>
                            <span className="text-muted-foreground">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
