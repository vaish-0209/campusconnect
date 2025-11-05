import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Get the origin from the request (respects the current port)
  const origin = request.headers.get("origin") || request.headers.get("referer")?.split("/").slice(0, 3).join("/") || process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  // Redirect based on role
  if (session.user.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", origin));
  } else if (session.user.role === "STUDENT") {
    return NextResponse.redirect(new URL("/student/dashboard", origin));
  }

  // Default fallback
  return NextResponse.redirect(new URL("/", origin));
}
