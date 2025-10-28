"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Building2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  venue: string | null;
  meetingLink: string | null;
  drive: {
    id: string;
    title: string;
    company: {
      name: string;
      logo: string | null;
    };
  };
}

export default function StudentCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/calendar");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TEST: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      INTERVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      PPT: "bg-green-500/10 text-green-400 border-green-500/20",
      GD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      WEBINAR: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    };
    return colors[type] || "bg-muted/10 text-muted-foreground border-muted/20";
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      {/* Navbar */}
      <nav className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/student/dashboard">
                <h1 className="text-xl font-semibold text-foreground tracking-wide">
                  Campus<span className="text-primary">Connect</span>
                </h1>
              </Link>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/student/dashboard" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
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
                <Link href="/student/calendar" className="px-4 py-2 text-sm font-medium text-foreground bg-primary/10 border border-primary/20 rounded-full transition-all">
                  Calendar
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/student/notifications" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                Notifications
              </Link>
              <Link href="/student/profile" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                Profile
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
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            My Calendar
          </h2>
          <p className="text-lg text-muted-foreground">
            View all upcoming placement events and schedules
          </p>
        </div>

        {/* Events List */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : events.length === 0 ? (
          <div className="glass-card border border-border/50 rounded-xl p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No upcoming events
            </h3>
            <p className="text-muted-foreground mb-6">
              Your scheduled events will appear here once you apply to drives
            </p>
            <Link
              href="/student/companies"
              className="inline-block px-6 py-3 gradient-primary text-white rounded-lg hover:opacity-90 transition-all font-medium"
            >
              Browse Companies
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {event.drive.company.logo ? (
                        <img
                          src={event.drive.company.logo}
                          alt={event.drive.company.name}
                          className="w-16 h-16 object-contain rounded-lg border border-border/50"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {event.drive.company.name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {event.title}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getEventTypeColor(
                            event.type
                          )}`}
                        >
                          {event.type}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        {event.drive.company.name} - {event.drive.title}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(event.startTime)}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.venue}
                          </div>
                        )}
                        {event.meetingLink && (
                          <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:text-primary/80"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* View Drive Button */}
                  <Link
                    href={`/student/companies/${event.drive.id}`}
                    className="px-5 py-2.5 glass-card border border-border/50 text-foreground rounded-lg hover:border-primary/30 transition-all font-medium"
                  >
                    View Drive
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
