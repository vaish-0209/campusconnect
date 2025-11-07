import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for seed endpoint (temporary)
  if (pathname === '/api/seed') {
    return NextResponse.next();
  }

  // Skip rate limiting for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions (css, js, images, etc.)
  ) {
    return NextResponse.next();
  }

  // CORS handling
  if (request.method === "OPTIONS") {
    return handleCORS(request);
  }

  // Add security headers
  const response = NextResponse.next();
  addSecurityHeaders(response);

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    // Skip rate limiting if Redis is not configured (development mode)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { ratelimit, authRatelimit, uploadRatelimit } = await import('./lib/ratelimit');

        // Get IP address
        const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';

        let limiter = ratelimit;

        // Apply stricter rate limits for auth endpoints
        if (pathname.startsWith('/api/auth') && !pathname.includes('/api/auth/session')) {
          limiter = authRatelimit;
        }
        // Apply upload rate limits
        else if (pathname.startsWith('/api/upload')) {
          limiter = uploadRatelimit;
        }

        // Check rate limit
        const { success, limit, remaining, reset } = await limiter.limit(ip);

        if (!success) {
          const errorResponse = NextResponse.json(
            {
              error: 'Too many requests',
              message: 'Please try again later',
              retryAfter: Math.ceil((reset - Date.now()) / 1000)
            },
            { status: 429 }
          );

          errorResponse.headers.set('X-RateLimit-Limit', limit.toString());
          errorResponse.headers.set('X-RateLimit-Remaining', '0');
          errorResponse.headers.set('X-RateLimit-Reset', reset.toString());
          errorResponse.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString());

          return errorResponse;
        }

        // Add rate limit headers to successful response
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', reset.toString());
      } catch (error) {
        console.error('Rate limiting error:', error);
        // If rate limiting fails, allow the request to proceed
      }
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect student routes
  if (pathname.startsWith("/api/student")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return response;
}

function handleCORS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ];

  const response = new NextResponse(null, { status: 200 });

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

function addSecurityHeaders(response: NextResponse) {
  // Only add security headers in production or if explicitly enabled
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_SECURITY_HEADERS === "true"
  ) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
