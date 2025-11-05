"use client";

import Link from "next/link";
import { Sparkles, Users, BarChart3, Bell, ArrowRight, GraduationCap, Building2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradients - matching login page */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-5xl animate-fade-in">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-4">
              <span className="gradient-text">CampusConnect</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Smart Placement Management Portal for BMSCE
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/login"
              className="group px-10 py-4 gradient-primary rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Login to Portal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Info text for new students */}
          <div className="mt-6 glass-card border border-border/30 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-semibold text-foreground">New student?</span> Check your college email for account setup instructions
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
            {/* Students Card */}
            <div className="glass-card p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">For Students</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Track applications, view placement drives, get personalized job recommendations, and manage your entire placement journey in one place
              </p>
              <div className="mt-4 pt-4 border-t border-border/30">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    AI Resume Analyzer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Smart Job Matching
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Application Tracking
                  </li>
                </ul>
              </div>
            </div>

            {/* Admins Card */}
            <div className="glass-card p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">For Admins</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Manage placement drives, upload shortlists, track statistics, and streamline the entire placement process with powerful admin tools
              </p>
              <div className="mt-4 pt-4 border-t border-border/30">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Kanban Board Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Advanced Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Bulk Operations
                  </li>
                </ul>
              </div>
            </div>

            {/* Real-time Updates Card */}
            <div className="glass-card p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bell className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Real-time Updates</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Get instant notifications for application deadlines, shortlist announcements, placement events, and important updates
              </p>
              <div className="mt-4 pt-4 border-t border-border/30">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Push Notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Email Alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Calendar Integration
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 glass-card p-8 rounded-2xl border border-border/50 max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
              <div className="text-center border-x border-border/30">
                <div className="text-4xl font-bold gradient-text mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Placement Rate</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              Built with <span className="text-red-500">❤️</span> for BMSCE Placement Cell
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
