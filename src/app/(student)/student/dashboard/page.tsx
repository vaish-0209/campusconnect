import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { FileText, CheckCircle, Video, Award, Building2, Calendar, TrendingUp } from "lucide-react";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    redirect("/login");
  }

  // Get application stats
  const applications = await prisma.application.findMany({
    where: { studentId: student.id },
  });

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) =>
      ["SHORTLISTED", "TEST_CLEARED", "INTERVIEW_CLEARED"].includes(a.status)
    ).length,
    interviews: applications.filter((a) =>
      a.status.includes("INTERVIEW")
    ).length,
    offers: applications.filter((a) => a.status === "OFFER").length,
  };

  // Get upcoming drives
  const upcomingDrives = await prisma.drive.findMany({
    where: {
      isActive: true,
      registrationEnd: { gte: new Date() },
    },
    include: {
      company: true,
      applications: {
        where: { studentId: student.id },
      },
    },
    orderBy: { registrationEnd: "asc" },
    take: 5,
  });

  const drivesWithEligibility = upcomingDrives.map((drive) => {
    const eligibility = checkEligibility(student, drive);
    const hasApplied = drive.applications.length > 0;
    return { ...drive, isEligible: eligibility.isEligible, hasApplied };
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-foreground tracking-wide">
                Campus<span className="text-primary">Connect</span>
              </h1>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/student/dashboard" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
                  Dashboard
                </Link>
                <Link href="/student/drives" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Drives
                </Link>
                <Link href="/student/companies" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Companies
                </Link>
                <Link href="/student/applications" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Applications
                </Link>
                <Link href="/student/calendar" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                  Calendar
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/student/notifications" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                Notifications
              </Link>
              <Link href="/student/profile" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                Profile
              </Link>
              <span className="text-sm text-muted-foreground">
                {student?.firstName} {student?.lastName}
              </span>
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
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Welcome back, {student?.firstName}! 👋
          </h2>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your placements
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/student/applications" className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Applications</div>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </Link>
          <Link href="/student/applications?status=SHORTLISTED" className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Shortlisted</div>
            <div className="text-3xl font-bold text-blue-400">{stats.shortlisted}</div>
          </Link>
          <Link href="/student/applications" className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Video className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Interviews</div>
            <div className="text-3xl font-bold text-orange-400">{stats.interviews}</div>
          </Link>
          <Link href="/student/applications?status=OFFER" className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Offers</div>
            <div className="text-3xl font-bold text-green-400">{stats.offers}</div>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="glass-card border border-border/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Profile
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Roll No</div>
              <div className="font-medium text-foreground mt-1">{student?.rollNo}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Branch</div>
              <div className="font-medium text-foreground mt-1">
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm">
                  {student?.branch}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">CGPA</div>
              <div className="font-medium text-foreground mt-1">{student?.cgpa}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Backlogs</div>
              <div className="font-medium text-foreground mt-1">{student?.backlogs}</div>
            </div>
          </div>
        </div>

        {/* Upcoming Drives */}
        <div className="glass-card border border-border/50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Upcoming Drives
            </h3>
            <Link
              href="/student/companies"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View all →
            </Link>
          </div>
          {drivesWithEligibility.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-foreground mb-2">No upcoming drives at the moment</p>
              <p className="text-sm text-muted-foreground">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drivesWithEligibility.map((drive) => (
                <div
                  key={drive.id}
                  className="glass-card border border-border/50 rounded-lg p-5 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">
                          {drive.company.name}
                        </h4>
                        {drive.company.tier && (
                          <span className="px-3 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full">
                            {drive.company.tier}
                          </span>
                        )}
                        {drive.hasApplied && (
                          <span className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                            ✓ Applied
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{drive.title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {drive.ctc && (
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            CTC: {formatCurrency(drive.ctc)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Closes: {formatDate(drive.registrationEnd)}
                        </span>
                      </div>
                    </div>
                    <div>
                      {drive.hasApplied ? (
                        <Link
                          href="/student/applications"
                          className="text-sm text-primary hover:text-primary/80 font-medium"
                        >
                          View Status
                        </Link>
                      ) : drive.isEligible ? (
                        <Link
                          href={`/student/companies/${drive.id}`}
                          className="px-5 py-2 gradient-primary text-white text-sm rounded-full hover:opacity-90 transition-all"
                        >
                          Apply
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not Eligible</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
