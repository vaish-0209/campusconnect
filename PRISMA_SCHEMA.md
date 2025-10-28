# 🗄️ CampusConnect Database Schema

Complete Prisma schema with audit logging, enums, and proper relations.

---

## prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum Role {
  STUDENT
  ADMIN
  RECRUITER
}

enum ApplicationStatus {
  APPLIED
  SHORTLISTED
  TEST_SCHEDULED
  TEST_CLEARED
  INTERVIEW_SCHEDULED
  INTERVIEW_CLEARED
  OFFER
  REJECTED
  WITHDRAWN
}

enum EventType {
  PPT
  TEST
  INTERVIEW
  OTHER
}

enum DocumentType {
  RESUME
  TRANSCRIPT
  CERTIFICATE
  NOC
  OTHER
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  INVITE_SENT
  PASSWORD_RESET
  SHORTLIST_UPLOAD
  DRIVE_PUBLISHED
  APPLICATION_SUBMITTED
  STATUS_CHANGED
  BULK_IMPORT
}

// ==================== CORE MODELS ====================

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String?        // Nullable for SSO users later
  role          Role           @default(STUDENT)
  isActive      Boolean        @default(false)
  inviteToken   String?        @unique
  inviteSentAt  DateTime?
  lastLoginAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  student       Student?
  notifications Notification[]

  @@index([email])
  @@index([inviteToken])
}

model Student {
  id            String        @id @default(cuid())
  userId        String        @unique
  rollNo        String        @unique
  firstName     String
  lastName      String
  branch        String        // CSE, ECE, MECH, IT, etc.
  cgpa          Float
  backlogs      Int           @default(0)
  phone         String?
  profilePhoto  String?       // Cloudinary URL
  skills        String[]      // Array of skills

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  applications  Application[]
  documents     Document[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([branch, cgpa])
  @@index([rollNo])
  @@index([userId])
}

model Company {
  id            String   @id @default(cuid())
  name          String   @unique
  logo          String?  // Cloudinary URL
  sector        String   // IT, Core, Consulting, Finance, etc.
  tier          String?  // Dream, Super Dream, Regular, etc.
  website       String?

  drives        Drive[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([name])
  @@index([sector])
}

model Drive {
  id                String    @id @default(cuid())
  companyId         String
  title             String    // "SDE Intern 2025"
  jobDescription    String    @db.Text
  role              String
  ctc               Float?
  ctcBreakup        String?   @db.Text
  location          String?
  bond              String?
  techStack         String[]

  // Eligibility Rules
  minCgpa           Float?
  maxBacklogs       Int       @default(0)
  allowedBranches   String[]  // ["CSE", "IT", "ECE"]

  // Dates
  registrationStart DateTime
  registrationEnd   DateTime

  isActive          Boolean   @default(true)

  company           Company       @relation(fields: [companyId], references: [id], onDelete: Cascade)
  applications      Application[]
  events            Event[]

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([companyId])
  @@index([isActive, registrationEnd])
  @@index([registrationStart, registrationEnd])
}

// ==================== APPLICATION (Many-to-Many Join) ====================

model Application {
  id            String            @id @default(cuid())
  studentId     String
  driveId       String
  status        ApplicationStatus @default(APPLIED)
  resumeUrl     String?           // Specific resume used for this drive
  remarks       String?           @db.Text
  appliedAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  student       Student           @relation(fields: [studentId], references: [id], onDelete: Cascade)
  drive         Drive             @relation(fields: [driveId], references: [id], onDelete: Cascade)

  @@unique([studentId, driveId])
  @@index([driveId, status])
  @@index([studentId])
  @@index([status])
}

// ==================== CALENDAR EVENTS ====================

model Event {
  id            String    @id @default(cuid())
  title         String
  description   String?   @db.Text
  type          EventType
  startTime     DateTime
  endTime       DateTime
  venue         String?
  meetingLink   String?
  driveId       String?

  drive         Drive?    @relation(fields: [driveId], references: [id], onDelete: Cascade)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([startTime, type])
  @@index([driveId])
  @@index([startTime, endTime])
}

// ==================== DOCUMENT VAULT ====================

model Document {
  id            String       @id @default(cuid())
  studentId     String
  type          DocumentType
  name          String       // "Resume_v2_Google.pdf"
  url           String       // Cloudinary URL
  publicId      String       // Cloudinary public_id for deletion
  version       Int          @default(1)
  size          Int?         // File size in bytes
  uploadedAt    DateTime     @default(now())

  student       Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId, type])
  @@index([studentId])
}

// ==================== NOTIFICATIONS ====================

model Notification {
  id            String   @id @default(cuid())
  userId        String
  title         String
  message       String   @db.Text
  type          String   // "DRIVE_ADDED", "DEADLINE_REMINDER", "SHORTLIST_UPDATE"
  isRead        Boolean  @default(false)
  link          String?  // Deep link to relevant page
  createdAt     DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead, createdAt])
  @@index([userId, createdAt])
}

// ==================== AUDIT LOGGING ====================

model AuditLog {
  id          String      @id @default(cuid())
  userId      String?     // Nullable for system actions
  userEmail   String      // Store email for reference
  action      AuditAction
  target      String      // "Drive", "Student", "Application", etc.
  targetId    String?     // ID of the affected entity
  meta        Json?       // Additional context (old/new values, IP, etc.)
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime    @default(now())

  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@index([target, targetId])
  @@index([createdAt])
}
```

---

## 🗂️ Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │◄────────┐
│ role        │         │
│ isActive    │         │
└─────────────┘         │
       │                │
       │ 1:1            │
       ▼                │
┌─────────────┐         │
│   Student   │         │
│─────────────│         │
│ id (PK)     │         │
│ userId (FK) │─────────┘
│ rollNo      │
│ cgpa        │
│ branch      │
└─────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐        ┌─────────────┐
│ Application  │ N:1    │    Drive    │
│──────────────│◄───────│─────────────│
│ id (PK)      │        │ id (PK)     │
│ studentId(FK)│        │ companyId   │
│ driveId (FK) │        │ title       │
│ status       │        │ eligibility │
│ resumeUrl    │        └─────────────┘
└──────────────┘               │
                               │ N:1
       ┌───────────────────────┘
       ▼
┌─────────────┐
│   Company   │
│─────────────│
│ id (PK)     │
│ name        │
│ sector      │
└─────────────┘

┌──────────────┐        ┌─────────────┐
│    Event     │ N:1    │    Drive    │
│──────────────│◄───────│─────────────│
│ id (PK)      │        │ id (PK)     │
│ driveId (FK) │        └─────────────┘
│ type         │
│ startTime    │
└──────────────┘

┌──────────────┐        ┌─────────────┐
│  Document    │ N:1    │   Student   │
│──────────────│◄───────│─────────────│
│ id (PK)      │        │ id (PK)     │
│ studentId(FK)│        └─────────────┘
│ type         │
│ url          │
└──────────────┘

┌──────────────┐        ┌─────────────┐
│Notification  │ N:1    │    User     │
│──────────────│◄───────│─────────────│
│ id (PK)      │        │ id (PK)     │
│ userId (FK)  │        └─────────────┘
│ message      │
│ isRead       │
└──────────────┘

┌──────────────┐
│  AuditLog    │ (No FK constraints - stores historical data)
│──────────────│
│ id (PK)      │
│ userId       │
│ action       │
│ target       │
│ meta (JSON)  │
└──────────────┘
```

---

## 📊 Table Sizes & Indexes

### **Expected Row Counts (for 1500 students):**

| Table | Estimated Rows | Growth Pattern |
|-------|----------------|----------------|
| User | ~1,550 | Low (annual intake) |
| Student | ~1,500 | Low |
| Company | ~100 | Low |
| Drive | ~50/year | Medium |
| Application | ~7,500 | High (5 apps/student avg) |
| Event | ~150/year | Medium |
| Document | ~6,000 | Medium (4 docs/student avg) |
| Notification | ~50,000 | High (30+ per student) |
| AuditLog | ~100,000+ | Very High |

### **Critical Indexes:**

```sql
-- Most frequently queried indexes
Student: (branch, cgpa) -- For eligibility checks
Application: (driveId, status) -- For shortlist queries
Application: (studentId, driveId) -- Unique constraint + lookup
Notification: (userId, isRead, createdAt) -- For notification feed
AuditLog: (action, createdAt) -- For audit reports
Event: (startTime, endTime) -- For conflict detection
```

---

## 🔄 Database Migrations

### **Initial Migration:**

```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### **Seed Script (prisma/seed.ts):**

```typescript
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@bmsce.ac.in",
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create sample companies
  const companies = await prisma.company.createMany({
    data: [
      {
        name: "Google",
        sector: "IT",
        tier: "Dream",
        website: "https://careers.google.com",
      },
      {
        name: "Microsoft",
        sector: "IT",
        tier: "Dream",
        website: "https://careers.microsoft.com",
      },
      {
        name: "Amazon",
        sector: "IT",
        tier: "Dream",
        website: "https://amazon.jobs",
      },
    ],
  });

  console.log("✅ Sample companies created:", companies.count);

  // Create sample student (for testing)
  const studentUser = await prisma.user.create({
    data: {
      email: "student@test.com",
      password: await bcrypt.hash("student123", 12),
      role: Role.STUDENT,
      isActive: true,
      student: {
        create: {
          rollNo: "1BM20CS001",
          firstName: "John",
          lastName: "Doe",
          branch: "CSE",
          cgpa: 8.5,
          backlogs: 0,
          phone: "+919876543210",
          skills: ["React", "Node.js", "Python"],
        },
      },
    },
  });

  console.log("✅ Test student created:", studentUser.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### **Run Seed:**

```bash
npx prisma db seed
```

---

## 🔍 Common Queries

### **Check eligibility for a drive:**

```typescript
async function checkEligibility(studentId: string, driveId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  const drive = await prisma.drive.findUnique({
    where: { id: driveId },
  });

  if (!student || !drive) return { eligible: false, reasons: ["Not found"] };

  const reasons = [];

  if (drive.minCgpa && student.cgpa < drive.minCgpa) {
    reasons.push(`CGPA below minimum (need ${drive.minCgpa}, have ${student.cgpa})`);
  }

  if (student.backlogs > drive.maxBacklogs) {
    reasons.push(`Too many backlogs (max ${drive.maxBacklogs}, have ${student.backlogs})`);
  }

  if (!drive.allowedBranches.includes(student.branch)) {
    reasons.push(`Branch not allowed (only ${drive.allowedBranches.join(", ")} allowed)`);
  }

  return { eligible: reasons.length === 0, reasons };
}
```

### **Get dashboard stats for student:**

```typescript
async function getStudentDashboard(studentId: string) {
  const stats = await prisma.application.groupBy({
    by: ["status"],
    where: { studentId },
    _count: true,
  });

  const upcomingDrives = await prisma.drive.findMany({
    where: {
      isActive: true,
      registrationEnd: { gte: new Date() },
    },
    include: { company: true },
    take: 5,
    orderBy: { registrationEnd: "asc" },
  });

  const nextEvent = await prisma.event.findFirst({
    where: {
      startTime: { gte: new Date() },
      drive: {
        applications: {
          some: { studentId },
        },
      },
    },
    include: { drive: { include: { company: true } } },
    orderBy: { startTime: "asc" },
  });

  return { stats, upcomingDrives, nextEvent };
}
```

### **Get placement analytics:**

```typescript
async function getPlacementAnalytics() {
  const totalStudents = await prisma.student.count();

  const placedStudents = await prisma.application.count({
    where: { status: "OFFER" },
    distinct: ["studentId"],
  });

  const byBranch = await prisma.student.groupBy({
    by: ["branch"],
    _count: true,
    _avg: { cgpa: true },
  });

  const topRecruiters = await prisma.application.groupBy({
    by: ["driveId"],
    where: { status: "OFFER" },
    _count: true,
    orderBy: { _count: { driveId: "desc" } },
    take: 10,
  });

  return {
    totalStudents,
    placedStudents,
    placementPercentage: (placedStudents / totalStudents) * 100,
    byBranch,
    topRecruiters,
  };
}
```

### **Bulk update applications (shortlist upload):**

```typescript
async function bulkUpdateApplications(
  driveId: string,
  updates: { rollNo: string; status: ApplicationStatus; remarks?: string }[]
) {
  const results = { updated: 0, failed: 0, errors: [] };

  for (const update of updates) {
    try {
      const student = await prisma.student.findUnique({
        where: { rollNo: update.rollNo },
      });

      if (!student) {
        results.failed++;
        results.errors.push({
          rollNo: update.rollNo,
          error: "Student not found",
        });
        continue;
      }

      await prisma.application.update({
        where: {
          studentId_driveId: {
            studentId: student.id,
            driveId,
          },
        },
        data: {
          status: update.status,
          remarks: update.remarks,
        },
      });

      results.updated++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        rollNo: update.rollNo,
        error: error.message,
      });
    }
  }

  return results;
}
```

---

## 🧹 Maintenance Queries

### **Clean up old notifications (older than 90 days):**

```typescript
await prisma.notification.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    isRead: true,
  },
});
```

### **Archive old audit logs:**

```typescript
// Move logs older than 1 year to archive table
await prisma.$executeRaw`
  INSERT INTO audit_log_archive
  SELECT * FROM "AuditLog"
  WHERE "createdAt" < NOW() - INTERVAL '1 year'
`;

await prisma.auditLog.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    },
  },
});
```

---

## 🔒 Security Considerations

1. **Password Hashing:**
   - Use bcrypt with 12 salt rounds
   - Never store plain passwords
   - Hash before inserting into DB

2. **Soft Deletes:**
   - Consider adding `deletedAt` field for soft deletes
   - Keep historical data for audit purposes

3. **Data Validation:**
   - Validate CGPA (0-10 range)
   - Validate email format
   - Validate phone numbers
   - Sanitize file uploads

4. **Access Control:**
   - Students can only read their own data
   - Admins have full access
   - Use row-level security for sensitive queries

---

## 📚 Related Files

- [API Documentation](./API_DOCUMENTATION.md)
- [Authentication Flow](./docs/AUTH.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

**Last Updated:** October 2025
