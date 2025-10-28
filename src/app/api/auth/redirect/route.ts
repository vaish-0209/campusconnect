import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  // Redirect based on role
  if (session.user.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", process.env.NEXTAUTH_URL));
  } else if (session.user.role === "STUDENT") {
    return NextResponse.redirect(new URL("/student/dashboard", process.env.NEXTAUTH_URL));
  }

  // Default fallback
  return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL));
}
