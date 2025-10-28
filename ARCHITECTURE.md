# 🏗️ CampusConnect - Architecture Documentation

Complete technical architecture and design decisions.

---

## 📚 Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [System Architecture](#system-architecture)
3. [Project Structure](#project-structure)
4. [Design Patterns](#design-patterns)
5. [Security Architecture](#security-architecture)
6. [Performance Considerations](#performance-considerations)
7. [Scalability Strategy](#scalability-strategy)

---

## 🛠️ Tech Stack Overview

### **Frontend**

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Next.js** | 14.x (App Router) | React framework | SSR/SSG, API routes, file-based routing, performance |
| **TypeScript** | 5.x | Type safety | Catch bugs early, better DX, maintainability |
| **Tailwind CSS** | 3.x | Styling | Rapid UI dev, consistent design, small bundle |
| **shadcn/ui** | Latest | Component library | Accessible, customizable, modern components |
| **React Hook Form** | 7.x | Form management | Performance, validation, great DX |
| **Zod** | 3.x | Schema validation | Type-safe validation, works with RHF |
| **Recharts** | 2.x | Charts/Analytics | Simple, customizable, React-native |

### **Backend**

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Next.js API Routes** | 14.x | Backend API | Serverless, same codebase, easy deployment |
| **Prisma** | 5.x | ORM | Type-safe queries, migrations, great DX |
| **PostgreSQL** | 15.x | Database | Robust, ACID compliance, JSON support |
| **NextAuth.js** | 4.x | Authentication | Battle-tested, flexible, supports multiple providers |

### **Infrastructure**

| Service | Purpose | Why Chosen |
|---------|---------|------------|
| **Vercel** | Frontend + API hosting | Free tier, auto-deploy, optimized for Next.js |
| **Neon** | PostgreSQL hosting | Serverless Postgres, free tier, fast |
| **Cloudinary** | File storage | Free tier, image optimization, CDN |
| **Resend** | Email service | Modern API, free tier, great deliverability |

### **Development Tools**

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing |
| **React Testing Library** | Component testing |
| **Playwright** | E2E testing |
| **Prettier** | Code formatting |
| **ESLint** | Code linting |
| **Husky** | Git hooks |

---

## 🏛️ System Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │    Admin     │  │     Auth     │      │
│  │   Portal     │  │  Dashboard   │  │     Pages    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  Next.js 14 App Router + React + TypeScript + Tailwind      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │    Admin     │  │     Auth     │      │
│  │     API      │  │     API      │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│       Middleware (Auth + Rate Limiting + Logging)            │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌─────────────┐ ┌─────────┐ ┌──────────┐
        │  PostgreSQL │ │Cloudinary│ │  Resend  │
        │   (Neon)    │ │ (Files) │ │ (Email)  │
        └─────────────┘ └─────────┘ └──────────┘
```

### **Request Flow**

```
1. User Request
   ↓
2. Next.js Middleware (Auth check, Role validation)
   ↓
3. API Route Handler
   ↓
4. Prisma ORM (Query building)
   ↓
5. PostgreSQL (Data retrieval)
   ↓
6. Business Logic (Eligibility check, etc.)
   ↓
7. Response Formatting (JSON)
   ↓
8. Client (React component re-render)
```

---

## 📁 Project Structure

```
college_placement/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (auth)/                   # Auth route group (no navbar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── setup-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (student)/                # Student route group (student navbar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── applications/
│   │   │   │   └── page.tsx
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── documents/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Student layout with navbar
│   │   │
│   │   ├── (admin)/                  # Admin route group (admin navbar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── students/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── import/
│   │   │   │       └── page.tsx
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── drives/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── shortlist/
│   │   │   │           └── page.tsx
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── audit-logs/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Admin layout with navbar
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── signup/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── student/
│   │   │   │   ├── profile/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── drives/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   ├── applications/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── calendar/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── documents/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   └── notifications/
│   │   │   │       ├── route.ts
│   │   │   │       └── [id]/
│   │   │   │           └── read/
│   │   │   │               └── route.ts
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       │   └── route.ts
│   │   │       ├── students/
│   │   │       │   ├── route.ts
│   │   │       │   ├── [id]/
│   │   │       │   │   └── route.ts
│   │   │       │   └── bulk-invite/
│   │   │       │       └── route.ts
│   │   │       ├── companies/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts
│   │   │       ├── drives/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/
│   │   │       │       ├── route.ts
│   │   │       │       ├── applications/
│   │   │       │       │   └── route.ts
│   │   │       │       └── shortlist/
│   │   │       │           └── route.ts
│   │   │       ├── events/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts
│   │   │       ├── analytics/
│   │   │       │   └── route.ts
│   │   │       └── audit-logs/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── student/
│   │   │   ├── drive-card.tsx
│   │   │   ├── application-tracker.tsx
│   │   │   ├── calendar-view.tsx
│   │   │   └── notification-bell.tsx
│   │   ├── admin/
│   │   │   ├── student-table.tsx
│   │   │   ├── drive-form.tsx
│   │   │   ├── shortlist-uploader.tsx
│   │   │   └── analytics-chart.tsx
│   │   └── shared/
│   │       ├── navbar.tsx
│   │       ├── sidebar.tsx
│   │       ├── loading-spinner.tsx
│   │       └── error-boundary.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client instance
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── utils.ts                  # Utility functions
│   │   ├── eligibility.ts            # Eligibility checker
│   │   ├── audit.ts                  # Audit logging helper
│   │   ├── email.ts                  # Email service
│   │   ├── upload.ts                 # File upload handler
│   │   └── validations.ts            # Zod schemas
│   │
│   ├── types/
│   │   ├── index.ts                  # Shared types
│   │   ├── api.ts                    # API request/response types
│   │   └── database.ts               # Extended Prisma types
│   │
│   ├── emails/
│   │   ├── templates/
│   │   │   ├── student-invite.tsx
│   │   │   ├── drive-announcement.tsx
│   │   │   ├── deadline-reminder.tsx
│   │   │   └── shortlist-update.tsx
│   │   ├── layouts/
│   │   │   └── base-layout.tsx
│   │   └── utils/
│   │       └── send-email.ts
│   │
│   └── middleware.ts                 # Route protection middleware
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Database seed script
│   └── migrations/                   # Migration files
│
├── tests/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── eligibility.test.ts
│   │   │   ├── audit.test.ts
│   │   │   └── email.test.ts
│   │   └── components/
│   │       ├── button.test.tsx
│   │       └── drive-card.test.tsx
│   ├── integration/
│   │   └── api/
│   │       ├── auth.test.ts
│   │       ├── drives.test.ts
│   │       └── applications.test.ts
│   └── e2e/
│       ├── student-flow.spec.ts
│       ├── admin-flow.spec.ts
│       └── application-flow.spec.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── PRISMA_SCHEMA.md
│   ├── ARCHITECTURE.md             # This file
│   ├── AUTH.md
│   ├── ADMIN_GUIDE.md
│   ├── STUDENT_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
│
├── .env.example
├── .env.local
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## 🎨 Design Patterns

### **1. Repository Pattern (via Prisma)**

Centralize database access through Prisma ORM:

```typescript
// lib/repositories/drive.repository.ts
export class DriveRepository {
  async findActiveD drives() {
    return await prisma.drive.findMany({
      where: { isActive: true },
      include: { company: true },
    });
  }

  async checkEligibility(studentId: string, driveId: string) {
    // Eligibility logic here
  }
}
```

### **2. Service Layer Pattern**

Business logic separated from API routes:

```typescript
// lib/services/application.service.ts
export class ApplicationService {
  async applyToDrive(studentId: string, driveId: string, resumeUrl: string) {
    // 1. Check eligibility
    // 2. Create application
    // 3. Send notification
    // 4. Create audit log
  }
}
```

### **3. Middleware Pattern**

Chain of responsibility for request processing:

```typescript
// middleware.ts
export default withAuth(
  function middleware(req) {
    // Role-based access control
    // Rate limiting
    // Logging
  }
);
```

### **4. Factory Pattern (Email Templates)**

```typescript
// emails/factory.ts
export class EmailFactory {
  static createEmail(type: EmailType, data: any) {
    switch (type) {
      case "INVITE":
        return <StudentInviteEmail {...data} />;
      case "DRIVE_ALERT":
        return <DriveAnnouncementEmail {...data} />;
      // ...
    }
  }
}
```

### **5. Observer Pattern (Notifications)**

```typescript
// lib/events/event-emitter.ts
export class EventEmitter {
  on(event: string, handler: Function) {
    // Register listener
  }

  emit(event: string, data: any) {
    // Notify all listeners
  }
}

// Usage:
eventEmitter.on("drive.created", async (drive) => {
  await notifyEligibleStudents(drive);
  await createAuditLog("DRIVE_PUBLISHED", drive.id);
});
```

---

## 🔒 Security Architecture

### **Authentication Flow**

```
1. User submits credentials
   ↓
2. NextAuth.js validates
   ↓
3. Bcrypt compares password hash
   ↓
4. JWT token generated (7-day expiry)
   ↓
5. Session cookie set (httpOnly, secure)
   ↓
6. User redirected to dashboard
```

### **Authorization Flow**

```
1. Request hits middleware
   ↓
2. Session token extracted from cookie
   ↓
3. Token verified & decoded
   ↓
4. User role extracted (STUDENT/ADMIN)
   ↓
5. Route permission checked
   ↓
6. Request allowed/denied
```

### **Security Layers**

```
┌─────────────────────────────────────────┐
│  Layer 1: Network (HTTPS, CORS)         │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  Layer 2: Rate Limiting                  │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  Layer 3: Authentication (NextAuth)      │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  Layer 4: Authorization (Role-based)     │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  Layer 5: Input Validation (Zod)         │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  Layer 6: SQL Injection Prevention       │
│          (Prisma parameterized queries)  │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│  Layer 7: Audit Logging                  │
└─────────────────────────────────────────┘
```

---

## ⚡ Performance Considerations

### **Database Optimization**

1. **Indexes on frequently queried fields:**
   - `Student: (branch, cgpa)`
   - `Application: (driveId, status)`
   - `Notification: (userId, isRead, createdAt)`

2. **Query optimization:**
   - Use `select` to fetch only required fields
   - Use `include` carefully (avoid N+1 queries)
   - Implement pagination for large datasets

3. **Connection pooling:**
   - Prisma handles connection pooling automatically
   - Configure max connections based on Neon limits

### **Frontend Optimization**

1. **Code splitting:**
   - Next.js automatic code splitting per route
   - Dynamic imports for heavy components

2. **Image optimization:**
   - Use Next.js `<Image>` component
   - Cloudinary for image transformations

3. **Caching:**
   - Static pages cached at CDN (Vercel Edge)
   - API responses cached where appropriate
   - Browser caching for static assets

### **API Optimization**

1. **Response compression:**
   - Gzip/Brotli enabled by default on Vercel

2. **Rate limiting:**
   - Prevent abuse
   - Protect against DDoS

3. **Lazy loading:**
   - Load notifications on scroll
   - Infinite scroll for long lists

---

## 📈 Scalability Strategy

### **Current Architecture (1500 students):**

- Single Next.js deployment on Vercel
- Single PostgreSQL instance on Neon
- Handles ~10,000 requests/day comfortably

### **Scale to 5,000 students:**

- Same architecture works
- Upgrade Neon to Pro plan if needed
- Enable database read replicas

### **Scale to 20,000+ students:**

- **Database:**
  - Implement read replicas
  - Partition large tables (AuditLog, Notification)
  - Move to dedicated Postgres (RDS/Cloud SQL)

- **Backend:**
  - Separate API from frontend (API gateway)
  - Implement Redis caching layer
  - Queue heavy operations (Bullish + Redis)

- **Frontend:**
  - CDN for static assets (already on Vercel)
  - Implement service worker for offline support

- **File Storage:**
  - Dedicated S3 bucket (replace Cloudinary)
  - CloudFront CDN for global distribution

### **Horizontal Scaling Readiness**

Current architecture is **stateless** and ready for horizontal scaling:

- No server-side sessions (JWT tokens)
- Database handles concurrency
- File storage is external (Cloudinary)
- Can add more Vercel serverless functions as needed

---

## 🧪 Testing Strategy

### **Unit Tests (Vitest)**
- Test business logic functions
- Test utility functions (eligibility check, etc.)
- Target: 80% code coverage

### **Integration Tests**
- Test API endpoints
- Test database operations
- Mock external services

### **E2E Tests (Playwright)**
- Test complete user flows
- Test critical paths (application submission)
- Run before each deployment

### **Performance Tests**
- Load testing with k6 or Artillery
- Database query performance profiling
- Frontend performance with Lighthouse

---

## 🚀 Deployment Architecture

### **Development Environment**

```
Local Machine
├── Next.js Dev Server (localhost:3000)
├── PostgreSQL (Local or Neon Dev)
└── Cloudinary (Dev account)
```

### **Production Environment**

```
Vercel Edge Network
├── Frontend (Static + SSR)
├── API Routes (Serverless Functions)
│   ├── us-east-1 (primary)
│   └── Auto-scaling based on load
│
Neon (PostgreSQL)
├── Primary DB (us-east-1)
└── Automatic backups (daily)

Cloudinary
├── Image/File CDN
└── Global distribution

Resend
└── Email delivery
```

---

## 📊 Monitoring & Logging

### **Application Monitoring**

- **Vercel Analytics:** Page views, performance metrics
- **Sentry:** Error tracking and alerting
- **LogRocket:** Session replay for debugging

### **Database Monitoring**

- **Neon Dashboard:** Query performance, connection pooling
- **Prisma Metrics:** Slow query detection

### **Audit Logging**

- All sensitive operations logged to `AuditLog` table
- Retention: 1 year in database, archived to S3 after

---

## 📚 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./PRISMA_SCHEMA.md)
- [Security Guide](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Last Updated:** October 2025
