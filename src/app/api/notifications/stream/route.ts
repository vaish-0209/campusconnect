import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      const message = `data: ${JSON.stringify({ type: "connected", message: "Connected to notification stream" })}\n\n`;
      controller.enqueue(encoder.encode(message));

      // Poll for new notifications every 5 seconds
      intervalId = setInterval(async () => {
        try {
          // Get unread notifications count
          const unreadCount = await prisma.notification.count({
            where: {
              userId: session.user.id,
              isRead: false,
            },
          });

          // Get latest notification
          const latestNotification = await prisma.notification.findFirst({
            where: {
              userId: session.user.id,
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          const data = {
            type: "notification_update",
            unreadCount,
            latestNotification,
            timestamp: new Date().toISOString(),
          };

          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }, 5000); // Poll every 5 seconds
    },
    cancel() {
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
