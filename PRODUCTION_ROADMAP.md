# 🚀 Production & Launch Roadmap - Phase 3

## Overview
This document outlines the implementation steps to make the College Placement Portal production-ready with scalable infrastructure, file storage, security, and monitoring.

---

## 1️⃣ PostgreSQL Migration (Neon/Supabase)

### Why Migrate?
- **SQLite Limitations**: Single-file database, no concurrent writes
- **PostgreSQL Benefits**:
  - Multi-user concurrency
  - Advanced indexing and full-text search
  - Better performance at scale
  - Cloud-native with Neon/Supabase

### Implementation Steps

#### Option A: Neon (Recommended for Serverless)
```bash
# 1. Create Neon account at https://neon.tech
# 2. Create new project
# 3. Copy connection string
```

#### Option B: Supabase (Recommended for Full Backend)
```bash
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Get database connection string from Settings > Database
```

### Migration Process

#### Step 1: Update Prisma Schema
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

#### Step 2: Environment Variables
```env
# .env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

#### Step 3: Migration Commands
```bash
# Generate new Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init_postgres

# Push schema to database
npx prisma db push

# Seed data
node seed_companies.js
node seed_realistic_drives.js
node seed_events_demo.js
node seed_demo_data.js
```

#### Step 4: Update Prisma Client Configuration
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Data Migration Script
```javascript
// migrate_data.js
const { PrismaClient: SQLitePrisma } = require('@prisma/client');
const { PrismaClient: PostgresPrisma } = require('@prisma/client');

const sqlite = new SQLitePrisma({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
});

const postgres = new PostgresPrisma({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function migrate() {
  // Migrate Users
  const users = await sqlite.user.findMany({ include: { student: true } });
  for (const user of users) {
    await postgres.user.create({ data: user });
  }

  // Continue for all models...
  console.log('Migration complete!');
}

migrate();
```

---

## 2️⃣ File Storage (Cloudinary / AWS S3)

### Why File Storage?
- **Current**: Base64 strings in database (inefficient, limited size)
- **Solution**: Cloud storage with URLs
  - Faster loading
  - CDN delivery
  - Unlimited size
  - Image optimization

### Option A: Cloudinary (Recommended - Easier)

#### Installation
```bash
npm install cloudinary multer next-connect
```

#### Configuration
```typescript
// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

#### Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Upload API Route
```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'college_placement',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

#### Client-Side Upload Component
```typescript
// components/FileUpload.tsx
'use client';

import { useState } from 'react';

export function FileUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      onUpload(data.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      onChange={handleUpload}
      disabled={uploading}
      accept=".pdf,.jpg,.jpeg,.png"
    />
  );
}
```

### Option B: AWS S3

#### Installation
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

#### Configuration
```typescript
// src/lib/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

---

## 3️⃣ Rate Limiting (Upstash Redis)

### Why Rate Limiting?
- Prevent API abuse
- Protect against DDoS attacks
- Fair resource allocation
- Cost control

### Implementation with Upstash Redis

#### Installation
```bash
npm install @upstash/redis @upstash/ratelimit
```

#### Configuration
```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// Different limits for different endpoints
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 login attempts per minute
});

export const uploadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'), // 3 uploads per minute
});
```

#### Environment Variables
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

#### Middleware Implementation
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ratelimit } from '@/lib/ratelimit';

export async function middleware(request: NextRequest) {
  // Get identifier (IP or user ID)
  const ip = request.ip ?? '127.0.0.1';

  // Check rate limit
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        limit,
        remaining,
        reset: new Date(reset)
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}

export const config = {
  matcher: '/api/:path*', // Apply to all API routes
};
```

#### API Route Example
```typescript
// src/app/api/auth/login/route.ts
import { authRatelimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';

  const { success } = await authRatelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Continue with login logic...
}
```

---

## 4️⃣ Email Service (Resend / Nodemailer)

### Option A: Resend (Recommended - Modern API)

#### Installation
```bash
npm install resend
```

#### Configuration
```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(
  to: string,
  studentName: string,
  inviteToken: string
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password?token=${inviteToken}`;

  try {
    const data = await resend.emails.send({
      from: 'BMSCE Placements <placements@bmsce.ac.in>',
      to: [to],
      subject: 'Welcome to Campus Placement Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to BMSCE Placement Portal!</h2>
          <p>Hi ${studentName},</p>
          <p>Your account has been created. Please click the button below to set your password:</p>
          <a href="${inviteUrl}"
             style="display: inline-block; padding: 12px 24px; background: #8B5CF6;
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Set Password
          </a>
          <p>Or copy this link: ${inviteUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: 'BMSCE Placements <placements@bmsce.ac.in>',
    to: [to],
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background: #8B5CF6;
                  color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  });
}

export async function sendApplicationStatusUpdate(
  to: string,
  studentName: string,
  companyName: string,
  role: string,
  newStatus: string
) {
  await resend.emails.send({
    from: 'BMSCE Placements <placements@bmsce.ac.in>',
    to: [to],
    subject: `Application Update - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Status Updated</h2>
        <p>Hi ${studentName},</p>
        <p>Your application for <strong>${role}</strong> at <strong>${companyName}</strong>
           has been updated to: <strong>${newStatus}</strong></p>
        <p>Login to view details: ${process.env.NEXT_PUBLIC_APP_URL}/student/applications</p>
      </div>
    `,
  });
}
```

#### Environment Variables
```env
RESEND_API_KEY=re_your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### Option B: Nodemailer (Traditional SMTP)

#### Installation
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

#### Configuration
```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}
```

#### Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="BMSCE Placements <placements@bmsce.ac.in>"
```

---

## 5️⃣ Error Monitoring (Sentry / Logtail)

### Option A: Sentry (Recommended - Comprehensive)

#### Installation
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Configuration
```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

```javascript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

#### Error Boundary
```typescript
// src/app/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

#### Manual Error Tracking
```typescript
// In your code
try {
  await someOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'student-application',
    },
    extra: {
      driveId: drive.id,
      studentId: student.id,
    },
  });
  throw error;
}
```

### Option B: Logtail (Better Dev Logs)

#### Installation
```bash
npm install @logtail/next
```

#### Configuration
```typescript
// src/lib/logger.ts
import { Logtail } from '@logtail/next';

export const logger = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!);

export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    error: error.stack,
    ...context,
  });
}

export function logInfo(message: string, data?: Record<string, any>) {
  logger.info(message, data);
}
```

---

## 📋 Implementation Checklist

### Phase 1: Database & Storage (Week 1)
- [ ] Create Neon/Supabase account
- [ ] Update Prisma schema to PostgreSQL
- [ ] Run migrations
- [ ] Migrate existing data
- [ ] Setup Cloudinary account
- [ ] Implement file upload API
- [ ] Update resume upload flow
- [ ] Update company logo upload flow
- [ ] Test file uploads

### Phase 2: Security & Email (Week 2)
- [ ] Create Upstash Redis account
- [ ] Implement rate limiting middleware
- [ ] Add rate limits to sensitive endpoints
- [ ] Setup Resend account
- [ ] Configure email templates
- [ ] Implement invitation emails
- [ ] Implement password reset emails
- [ ] Implement notification emails
- [ ] Test email delivery

### Phase 3: Monitoring & Deployment (Week 3)
- [ ] Setup Sentry project
- [ ] Configure error tracking
- [ ] Add error boundaries
- [ ] Setup performance monitoring
- [ ] Create deployment configuration
- [ ] Configure environment variables
- [ ] Deploy to Vercel/Railway
- [ ] Run production tests
- [ ] Monitor performance

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 3: Docker + DigitalOcean
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 💰 Cost Estimation (Monthly)

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Neon (PostgreSQL)** | 10GB free | $19/month (Pro) |
| **Cloudinary** | 25GB free | $89/month (Plus) |
| **Upstash Redis** | 10k requests/day free | $0.20 per 100k requests |
| **Resend** | 100 emails/day free | $20/month (100k emails) |
| **Sentry** | 5k errors/month free | $26/month (50k errors) |
| **Vercel** | Hobby tier free | $20/month (Pro) |
| **Total (Free Tier)** | **$0/month** | - |
| **Total (Paid)** | - | **~$174/month** |

---

## 📝 Environment Variables Template

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Resend
RESEND_API_KEY="re_your_api_key"

# Sentry
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project"

# App
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

---

**Status**: Ready for Implementation ✅
**Priority**: High 🔥
**Timeline**: 3 weeks
**Team**: 1-2 developers
