"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationData {
  type: string;
  unreadCount: number;
  latestNotification?: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  };
  timestamp: string;
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [latestNotif, setLatestNotif] = useState<NotificationData["latestNotification"]>();
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Setup SSE connection
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onmessage = (event) => {
      try {
        const data: NotificationData = JSON.parse(event.data);

        if (data.type === "notification_update") {
          setUnreadCount(data.unreadCount);

          // Show toast for new notifications
          if (
            data.latestNotification &&
            data.latestNotification.id !== lastNotificationId &&
            !data.latestNotification.isRead
          ) {
            setLatestNotif(data.latestNotification);
            setLastNotificationId(data.latestNotification.id);
            setShowToast(true);

            // Hide toast after 5 seconds
            setTimeout(() => setShowToast(false), 5000);
          }
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [lastNotificationId]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  return (
    <>
      <Link
        href="/student/notifications"
        className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-all"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      {/* Toast Notification */}
      {showToast && latestNotif && (
        <div className="fixed top-20 right-4 z-50 animate-slide-down">
          <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  {latestNotif.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {latestNotif.message}
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
