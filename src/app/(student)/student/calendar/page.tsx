"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Building2, ChevronLeft, ChevronRight, List } from "lucide-react";
import { StudentNavbar } from "@/components/student/StudentNavbar";

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
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayEvents, setShowDayEvents] = useState(false);

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

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TEST: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      INTERVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      PPT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      OTHER: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    return colors[type] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (date: Date | null, dayEvents: Event[]) => {
    if (!date || dayEvents.length === 0) return;
    setSelectedDate(date);
    setShowDayEvents(true);
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      {/* Navbar */}
      <StudentNavbar />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              My Calendar
            </h2>
            <p className="text-lg text-muted-foreground">
              View all upcoming placement events and schedules
            </p>
          </div>
          <div className="flex items-center gap-2 glass-card border border-border/50 rounded-full p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'gradient-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'gradient-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' ? (
          <div className="glass-card border border-border/50 rounded-xl overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-card/50 border-b border-border/50 px-6 py-4 flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-primary/10 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <h3 className="text-xl font-semibold text-foreground">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-primary/10 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentDate).map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  return (
                    <div
                      key={index}
                      className={`min-h-[140px] border border-border/50 rounded-lg p-3 ${
                        date ? 'bg-card hover:border-primary/30 transition-all cursor-pointer' : 'bg-transparent border-transparent'
                      } ${isToday(date) ? 'border-primary/50 bg-primary/5' : ''}`}
                      onClick={() => handleDateClick(date, dayEvents)}
                    >
                      {date && (
                        <>
                          <div className={`text-base font-semibold mb-2 ${
                            isToday(date) ? 'text-primary font-bold' : 'text-foreground'
                          }`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1.5">
                            {dayEvents.slice(0, 3).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs px-2 py-1.5 rounded border cursor-pointer hover:opacity-80 transition-all ${getEventTypeColor(event.type)}`}
                                title={event.title}
                              >
                                <div className="truncate font-semibold">{event.type}</div>
                                <div className="truncate text-[11px] opacity-90 mt-0.5">
                                  {new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </div>
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-primary font-medium px-2 py-1 cursor-pointer hover:underline">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-4">
                    {event.drive.company.logo ? (
                      <img
                        src={event.drive.company.logo}
                        alt={event.drive.company.name}
                        className="w-12 h-12 rounded object-contain bg-white p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.drive.company.name} - {event.drive.title}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
                          </span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                        {event.meetingLink && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="w-4 h-4 text-primary" />
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/student/drives/${event.drive.id}`}
                      className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-all"
                    >
                      View Drive
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card border border-border/50 rounded-xl p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No events scheduled yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Day Events Modal */}
      {showDayEvents && selectedDate && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDayEvents(false)}
        >
          <div
            className="glass-card border border-border/50 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setShowDayEvents(false)}
                className="p-2 hover:bg-secondary/50 rounded-lg transition-all"
              >
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="glass-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {event.drive.company.logo && (
                      <img
                        src={event.drive.company.logo}
                        alt={event.drive.company.name}
                        className="w-12 h-12 rounded object-contain bg-white p-1"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-1">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.drive.company.name} - {event.drive.title}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
                      </span>
                    </div>

                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue}</span>
                      </div>
                    )}

                    {event.meetingLink && (
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-primary" />
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
