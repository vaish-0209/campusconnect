import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple proxy - no authentication check for now
export default function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/dashboard"],
};
