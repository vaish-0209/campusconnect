"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, User } from "lucide-react";

interface StudentNavbarProps {
  studentName?: string;
}

export function StudentNavbar({ studentName }: StudentNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: "/student/dashboard", label: "Dashboard" },
    { href: "/student/recommendations", label: "For You" },
    { href: "/student/drives", label: "Drives" },
    { href: "/student/companies", label: "Companies" },
    { href: "/student/applications", label: "Applications" },
    { href: "/student/resume-analyzer", label: "Resume AI" },
  ];

  return (
    <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/student/dashboard">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-wide">
              Campus<span className="text-primary">Connect</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isActive(item.href)
                    ? "text-foreground bg-primary/10 border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <Link
              href="/student/notifications"
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all"
            >
              <Bell className="w-5 h-5" />
            </Link>

            {/* Profile - Desktop */}
            <Link
              href="/student/profile"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>

            {/* Logout - Desktop */}
            <Link
              href="/api/auth/signout"
              className="hidden sm:block px-5 py-2 bg-card border border-border/50 text-foreground text-sm font-medium rounded-full hover:border-primary/30 transition-all"
            >
              Logout
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-secondary/50 rounded-full transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive(item.href)
                      ? "text-foreground bg-primary/10 border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/student/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
              >
                Profile
              </Link>
              <Link
                href="/api/auth/signout"
                className="px-4 py-3 text-sm font-medium bg-card border border-border/50 text-foreground rounded-lg hover:border-primary/30 transition-all text-center"
              >
                Logout
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
