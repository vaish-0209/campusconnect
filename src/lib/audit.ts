import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";
import { NextRequest } from "next/server";

interface CreateAuditLogParams {
  userId?: string;
  userEmail: string;
  action: AuditAction;
  target: string;
  targetId?: string;
  meta?: Record<string, any>;
  req?: NextRequest;
}

/**
 * Create an audit log entry
 * This should be called after important admin actions
 */
export async function createAuditLog({
  userId,
  userEmail,
  action,
  target,
  targetId,
  meta,
  req,
}: CreateAuditLogParams) {
  try {
    // Extract IP and User-Agent from request if provided
    const ipAddress = req
      ? req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
      : undefined;

    const userAgent = req ? req.headers.get("user-agent") || undefined : undefined;

    await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        action,
        target,
        targetId,
        meta: meta || undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Don't throw - we don't want audit logging to break the main flow
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Helper to extract request metadata for audit logs
 */
export function getRequestMetadata(req: NextRequest) {
  return {
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
    method: req.method,
    url: req.url,
  };
}
