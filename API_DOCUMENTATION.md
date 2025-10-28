# 📡 CampusConnect API Documentation v1.0

## Base URL
```
Development: http://localhost:3000/api
Production: https://campusconnect.edu/api
```

## Authentication
All protected endpoints require a valid session cookie from NextAuth.js

**Headers:**
```
Cookie: next-auth.session-token=<token>
```

---

## 🔐 Authentication Endpoints

### **POST /api/auth/signup**
Create new user account (invite-only)

**Request:**
```json
{
  "inviteToken": "abc123xyz",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "userId": "clxyz123"
}
```

---

### **POST /api/auth/login**
User login (handled by NextAuth)

**Request:**
```json
{
  "email": "john@student.bmsce.ac.in",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clxyz123",
    "email": "john@student.bmsce.ac.in",
    "role": "STUDENT"
  },
  "sessionToken": "..."
}
```

---

## 👨‍🎓 Student Endpoints

### **GET /api/student/profile**
Get current student's profile

**Auth:** Required (STUDENT)

**Response (200):**
```json
{
  "id": "clxyz123",
  "rollNo": "1BM20CS001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@student.bmsce.ac.in",
  "branch": "CSE",
  "cgpa": 8.5,
  "backlogs": 0,
  "phone": "+919876543210",
  "skills": ["React", "Node.js", "Python"],
  "profilePhoto": "https://res.cloudinary.com/..."
}
```

---

### **PATCH /api/student/profile**
Update student profile

**Auth:** Required (STUDENT)

**Request:**
```json
{
  "cgpa": 8.7,
  "phone": "+919876543210",
  "skills": ["React", "Node.js", "Python", "Docker"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### **GET /api/student/dashboard**
Get dashboard summary

**Auth:** Required (STUDENT)

**Response (200):**
```json
{
  "stats": {
    "totalApplications": 5,
    "shortlisted": 2,
    "interviews": 1,
    "offers": 1
  },
  "upcomingDrives": [
    {
      "id": "drive123",
      "company": {
        "name": "Google",
        "logo": "https://..."
      },
      "title": "SDE Intern 2025",
      "ctc": 12.0,
      "registrationEnd": "2025-11-05T23:59:59Z",
      "isEligible": true
    }
  ],
  "nextEvent": {
    "id": "event123",
    "title": "Google PPT",
    "type": "PPT",
    "startTime": "2025-10-30T14:00:00Z",
    "venue": "Hall A"
  }
}
```

---

### **GET /api/student/drives**
List all active drives with eligibility

**Auth:** Required (STUDENT)

**Query Params:**
- `branch` (optional): Filter by branch
- `minCtc` (optional): Minimum CTC filter
- `search` (optional): Search in company/role
- `page` (default: 1)
- `limit` (default: 20)

**Response (200):**
```json
{
  "drives": [
    {
      "id": "drive123",
      "company": {
        "id": "comp123",
        "name": "Google",
        "logo": "https://...",
        "sector": "IT"
      },
      "title": "SDE Intern 2025",
      "role": "Software Development Engineer",
      "ctc": 12.0,
      "location": "Bangalore",
      "minCgpa": 8.0,
      "maxBacklogs": 0,
      "allowedBranches": ["CSE", "IT"],
      "registrationStart": "2025-10-28T00:00:00Z",
      "registrationEnd": "2025-11-05T23:59:59Z",
      "isEligible": true,
      "hasApplied": false
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### **GET /api/student/drives/:id**
Get detailed drive information

**Auth:** Required (STUDENT)

**Response (200):**
```json
{
  "id": "drive123",
  "company": {
    "id": "comp123",
    "name": "Google",
    "logo": "https://...",
    "sector": "IT",
    "website": "https://careers.google.com"
  },
  "title": "SDE Intern 2025",
  "role": "Software Development Engineer",
  "jobDescription": "Full markdown/HTML description...",
  "ctc": 12.0,
  "ctcBreakup": "Base: ₹10L, Performance Bonus: ₹2L",
  "location": "Bangalore",
  "bond": "None",
  "techStack": ["Go", "Kubernetes", "Python"],
  "minCgpa": 8.0,
  "maxBacklogs": 0,
  "allowedBranches": ["CSE", "IT"],
  "registrationStart": "2025-10-28T00:00:00Z",
  "registrationEnd": "2025-11-05T23:59:59Z",
  "events": [
    {
      "id": "event123",
      "title": "Pre-Placement Talk",
      "type": "PPT",
      "startTime": "2025-10-30T14:00:00Z",
      "endTime": "2025-10-30T15:30:00Z",
      "venue": "Hall A"
    }
  ],
  "eligibility": {
    "isEligible": true,
    "reasons": []
  },
  "application": null
}
```

**Eligibility Reasons (if not eligible):**
```json
{
  "eligibility": {
    "isEligible": false,
    "reasons": [
      "CGPA below minimum requirement (need 8.0, have 7.5)",
      "Branch not allowed (only CSE, IT allowed)"
    ]
  }
}
```

---

### **POST /api/student/applications**
Apply to a drive

**Auth:** Required (STUDENT)

**Request:**
```json
{
  "driveId": "drive123",
  "resumeUrl": "https://res.cloudinary.com/.../resume_v2.pdf"
}
```

**Response (201):**
```json
{
  "success": true,
  "applicationId": "app123",
  "message": "Application submitted successfully"
}
```

**Error (400):**
```json
{
  "error": "NOT_ELIGIBLE",
  "message": "You are not eligible for this drive",
  "reasons": ["CGPA below minimum requirement"]
}
```

**Error (409):**
```json
{
  "error": "ALREADY_APPLIED",
  "message": "You have already applied to this drive"
}
```

---

### **GET /api/student/applications**
Get all student applications

**Auth:** Required (STUDENT)

**Query Params:**
- `status` (optional): Filter by ApplicationStatus
- `page`, `limit`

**Response (200):**
```json
{
  "applications": [
    {
      "id": "app123",
      "status": "SHORTLISTED",
      "appliedAt": "2025-10-28T10:30:00Z",
      "updatedAt": "2025-11-01T15:00:00Z",
      "resumeUrl": "https://...",
      "remarks": "Strong technical background",
      "drive": {
        "id": "drive123",
        "company": {
          "name": "Google",
          "logo": "https://..."
        },
        "title": "SDE Intern 2025",
        "role": "Software Development Engineer"
      }
    }
  ],
  "pagination": { "total": 5, "page": 1, "limit": 20 }
}
```

---

### **GET /api/student/calendar**
Get student's placement calendar

**Auth:** Required (STUDENT)

**Query Params:**
- `startDate` (ISO date, optional): Default to current month start
- `endDate` (ISO date, optional): Default to current month end
- `type` (optional): Filter by EventType (PPT, TEST, INTERVIEW, OTHER)

**Response (200):**
```json
{
  "events": [
    {
      "id": "event123",
      "title": "Google PPT",
      "description": "Pre-placement talk for SDE role",
      "type": "PPT",
      "startTime": "2025-10-30T14:00:00Z",
      "endTime": "2025-10-30T15:30:00Z",
      "venue": "Hall A",
      "meetingLink": null,
      "drive": {
        "id": "drive123",
        "company": {
          "name": "Google",
          "logo": "https://..."
        },
        "title": "SDE Intern 2025"
      }
    },
    {
      "id": "event124",
      "title": "Microsoft Online Test",
      "description": "Coding assessment",
      "type": "TEST",
      "startTime": "2025-11-02T10:00:00Z",
      "endTime": "2025-11-02T12:00:00Z",
      "venue": null,
      "meetingLink": "https://codility.com/test/abc123",
      "drive": {
        "id": "drive124",
        "company": {
          "name": "Microsoft",
          "logo": "https://..."
        },
        "title": "SDE Full-Time 2025"
      }
    }
  ]
}
```

---

### **GET /api/student/documents**
Get student's uploaded documents

**Auth:** Required (STUDENT)

**Query Params:**
- `type` (optional): Filter by DocumentType

**Response (200):**
```json
{
  "documents": [
    {
      "id": "doc123",
      "type": "RESUME",
      "name": "Resume_Google_v2.pdf",
      "url": "https://res.cloudinary.com/...",
      "version": 2,
      "uploadedAt": "2025-10-25T10:00:00Z"
    },
    {
      "id": "doc124",
      "type": "TRANSCRIPT",
      "name": "Academic_Transcript_Sem6.pdf",
      "url": "https://res.cloudinary.com/...",
      "version": 1,
      "uploadedAt": "2025-10-20T14:30:00Z"
    }
  ]
}
```

---

### **POST /api/student/documents**
Upload a new document

**Auth:** Required (STUDENT)

**Request (multipart/form-data):**
```
file: <File>
type: "RESUME" | "TRANSCRIPT" | "CERTIFICATE" | "NOC" | "OTHER"
name: "Resume_v3.pdf"
```

**Response (201):**
```json
{
  "success": true,
  "document": {
    "id": "doc125",
    "type": "RESUME",
    "name": "Resume_v3.pdf",
    "url": "https://res.cloudinary.com/...",
    "version": 3,
    "uploadedAt": "2025-10-28T16:00:00Z"
  }
}
```

**Error (400):**
```json
{
  "error": "INVALID_FILE_TYPE",
  "message": "Only PDF files are allowed",
  "allowedTypes": [".pdf"]
}
```

**Error (413):**
```json
{
  "error": "FILE_TOO_LARGE",
  "message": "File size exceeds 5MB limit",
  "maxSize": "5MB"
}
```

---

### **DELETE /api/student/documents/:id**
Delete a document

**Auth:** Required (STUDENT)

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

### **GET /api/student/notifications**
Get notifications

**Auth:** Required (STUDENT)

**Query Params:**
- `unreadOnly` (boolean): Default false
- `page`, `limit`

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "notif123",
      "title": "New Drive Alert",
      "message": "Google has posted a new SDE Intern drive. Registration closes on Nov 5.",
      "type": "DRIVE_ADDED",
      "isRead": false,
      "link": "/student/drives/drive123",
      "createdAt": "2025-10-28T09:00:00Z"
    },
    {
      "id": "notif124",
      "title": "Shortlist Update",
      "message": "Congratulations! You've been shortlisted for Microsoft SDE interview.",
      "type": "SHORTLIST_UPDATE",
      "isRead": false,
      "link": "/student/applications/app125",
      "createdAt": "2025-10-27T15:30:00Z"
    },
    {
      "id": "notif125",
      "title": "Deadline Reminder",
      "message": "Amazon SDE drive registration closes in 24 hours.",
      "type": "DEADLINE_REMINDER",
      "isRead": true,
      "link": "/student/drives/drive126",
      "createdAt": "2025-10-26T10:00:00Z"
    }
  ],
  "unreadCount": 3,
  "pagination": { "total": 15, "page": 1, "limit": 20 }
}
```

---

### **PATCH /api/student/notifications/:id/read**
Mark notification as read

**Auth:** Required (STUDENT)

**Response (200):**
```json
{
  "success": true
}
```

---

### **PATCH /api/student/notifications/read-all**
Mark all notifications as read

**Auth:** Required (STUDENT)

**Response (200):**
```json
{
  "success": true,
  "marked": 12
}
```

---

## 👨‍💼 Admin Endpoints

### **GET /api/admin/dashboard**
Get admin dashboard overview

**Auth:** Required (ADMIN)

**Response (200):**
```json
{
  "stats": {
    "totalStudents": 1500,
    "activeStudents": 1450,
    "placedStudents": 850,
    "placementPercentage": 56.7,
    "averageCtc": 8.2,
    "medianCtc": 7.5,
    "highestCtc": 45.0,
    "totalDrives": 42,
    "activeDrives": 5,
    "completedDrives": 37
  },
  "recentActivity": [
    {
      "type": "APPLICATION",
      "message": "50 students applied to Google SDE Intern",
      "timestamp": "2025-10-28T10:30:00Z",
      "link": "/admin/drives/drive123"
    },
    {
      "type": "SHORTLIST",
      "message": "Admin uploaded shortlist for Microsoft SDE",
      "timestamp": "2025-10-28T09:15:00Z",
      "link": "/admin/drives/drive124"
    }
  ],
  "upcomingEvents": [
    {
      "id": "event123",
      "title": "Google PPT",
      "type": "PPT",
      "startTime": "2025-10-30T14:00:00Z",
      "drive": { "title": "SDE Intern 2025" }
    }
  ]
}
```

---

### **GET /api/admin/students**
List all students

**Auth:** Required (ADMIN)

**Query Params:**
- `branch` (optional): Filter by branch (CSE, IT, ECE, etc.)
- `minCgpa` (optional): Minimum CGPA filter
- `maxBacklogs` (optional): Maximum backlogs filter
- `isPlaced` (boolean, optional): Filter placed/unplaced students
- `search` (optional): Search by name/roll no/email
- `page` (default: 1)
- `limit` (default: 50)

**Response (200):**
```json
{
  "students": [
    {
      "id": "student123",
      "rollNo": "1BM20CS001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@student.bmsce.ac.in",
      "branch": "CSE",
      "cgpa": 8.5,
      "backlogs": 0,
      "phone": "+919876543210",
      "isActive": true,
      "applicationsCount": 5,
      "offersCount": 1,
      "lastLogin": "2025-10-28T08:30:00Z"
    }
  ],
  "pagination": { "total": 1500, "page": 1, "limit": 50, "totalPages": 30 }
}
```

---

### **GET /api/admin/students/:id**
Get detailed student profile

**Auth:** Required (ADMIN)

**Response (200):**
```json
{
  "id": "student123",
  "rollNo": "1BM20CS001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@student.bmsce.ac.in",
  "branch": "CSE",
  "cgpa": 8.5,
  "backlogs": 0,
  "phone": "+919876543210",
  "skills": ["React", "Node.js", "Python"],
  "profilePhoto": "https://...",
  "isActive": true,
  "applications": [
    {
      "id": "app123",
      "drive": {
        "company": { "name": "Google" },
        "title": "SDE Intern 2025"
      },
      "status": "SHORTLISTED",
      "appliedAt": "2025-10-28T10:30:00Z"
    }
  ],
  "documents": [
    {
      "id": "doc123",
      "type": "RESUME",
      "name": "Resume_v2.pdf",
      "url": "https://..."
    }
  ]
}
```

---

### **PATCH /api/admin/students/:id**
Update student profile (admin override)

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "cgpa": 8.7,
  "backlogs": 0,
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Student profile updated successfully"
}
```

---

### **POST /api/admin/students/bulk-invite**
Upload CSV and send invites

**Auth:** Required (ADMIN)

**Request (multipart/form-data):**
```
file: <CSV File>
```

**CSV Format:**
```csv
rollNo,firstName,lastName,email,branch,cgpa,backlogs
1BM20CS001,John,Doe,john@student.bmsce.ac.in,CSE,8.5,0
1BM20CS002,Jane,Smith,jane@student.bmsce.ac.in,CSE,9.0,0
```

**Response (201):**
```json
{
  "success": true,
  "imported": 150,
  "failed": 2,
  "errors": [
    { "row": 5, "email": "duplicate@example.com", "error": "Email already exists" },
    { "row": 12, "rollNo": "INVALID", "error": "Invalid roll number format" }
  ],
  "invitesSent": 150
}
```

---

### **GET /api/admin/companies**
List all companies

**Auth:** Required (ADMIN)

**Query Params:**
- `sector` (optional)
- `tier` (optional)
- `search` (optional)

**Response (200):**
```json
{
  "companies": [
    {
      "id": "comp123",
      "name": "Google",
      "logo": "https://...",
      "sector": "IT",
      "tier": "Dream",
      "website": "https://careers.google.com",
      "drivesCount": 3,
      "lastVisit": "2025-10-28"
    }
  ]
}
```

---

### **POST /api/admin/companies**
Create new company

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "name": "Google",
  "logo": "https://...",
  "sector": "IT",
  "tier": "Dream",
  "website": "https://careers.google.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "company": {
    "id": "comp123",
    "name": "Google",
    "logo": "https://...",
    "sector": "IT",
    "tier": "Dream"
  }
}
```

---

### **PATCH /api/admin/companies/:id**
Update company details

**Auth:** Required (ADMIN)

**Request:** (all fields optional)
```json
{
  "logo": "https://new-logo.png",
  "tier": "Super Dream"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Company updated successfully"
}
```

---

### **DELETE /api/admin/companies/:id**
Delete company (only if no associated drives)

**Auth:** Required (ADMIN)

**Response (200):**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Error (409):**
```json
{
  "error": "CONFLICT",
  "message": "Cannot delete company with existing drives",
  "drivesCount": 3
}
```

---

### **GET /api/admin/drives**
List all drives

**Auth:** Required (ADMIN)

**Query Params:**
- `companyId` (optional)
- `isActive` (boolean, optional)
- `search` (optional)
- `page`, `limit`

**Response (200):**
```json
{
  "drives": [
    {
      "id": "drive123",
      "company": {
        "id": "comp123",
        "name": "Google",
        "logo": "https://..."
      },
      "title": "SDE Intern 2025",
      "role": "Software Development Engineer",
      "ctc": 12.0,
      "registrationStart": "2025-10-28T00:00:00Z",
      "registrationEnd": "2025-11-05T23:59:59Z",
      "isActive": true,
      "applicationsCount": 300,
      "shortlistedCount": 50,
      "offersCount": 15,
      "createdAt": "2025-10-27T10:00:00Z"
    }
  ],
  "pagination": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

---

### **GET /api/admin/drives/:id**
Get detailed drive information

**Auth:** Required (ADMIN)

**Response (200):**
```json
{
  "id": "drive123",
  "company": {
    "id": "comp123",
    "name": "Google",
    "logo": "https://...",
    "sector": "IT",
    "tier": "Dream"
  },
  "title": "SDE Intern 2025",
  "role": "Software Development Engineer",
  "jobDescription": "Full markdown description...",
  "ctc": 12.0,
  "ctcBreakup": "Base: ₹10L, Performance Bonus: ₹2L",
  "location": "Bangalore",
  "bond": "None",
  "techStack": ["Go", "Kubernetes", "Python"],
  "minCgpa": 8.0,
  "maxBacklogs": 0,
  "allowedBranches": ["CSE", "IT"],
  "registrationStart": "2025-10-28T00:00:00Z",
  "registrationEnd": "2025-11-05T23:59:59Z",
  "isActive": true,
  "stats": {
    "eligibleStudents": 450,
    "applicationsCount": 300,
    "shortlistedCount": 50,
    "interviewsScheduled": 30,
    "offersCount": 15
  },
  "events": [
    {
      "id": "event123",
      "title": "Pre-Placement Talk",
      "type": "PPT",
      "startTime": "2025-10-30T14:00:00Z",
      "venue": "Hall A"
    }
  ],
  "createdAt": "2025-10-27T10:00:00Z",
  "updatedAt": "2025-10-28T09:00:00Z"
}
```

---

### **POST /api/admin/drives**
Create new drive

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "companyId": "comp123",
  "title": "SDE Intern 2025",
  "role": "Software Development Engineer",
  "jobDescription": "## About the Role\n\nWe are looking for...",
  "ctc": 12.0,
  "ctcBreakup": "Base: ₹10L, Performance Bonus: ₹2L",
  "location": "Bangalore",
  "bond": "None",
  "techStack": ["Go", "Kubernetes", "Python"],
  "minCgpa": 8.0,
  "maxBacklogs": 0,
  "allowedBranches": ["CSE", "IT"],
  "registrationStart": "2025-10-28T00:00:00Z",
  "registrationEnd": "2025-11-05T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "drive": {
    "id": "drive123",
    "title": "SDE Intern 2025",
    "company": { "name": "Google" }
  },
  "eligibleStudents": 450,
  "notificationsSent": 450
}
```

---

### **PATCH /api/admin/drives/:id**
Update drive

**Auth:** Required (ADMIN)

**Request:** (all fields optional)
```json
{
  "registrationEnd": "2025-11-07T23:59:59Z",
  "minCgpa": 7.5,
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Drive updated successfully",
  "eligibleStudentsChanged": true,
  "newEligibleCount": 650
}
```

---

### **DELETE /api/admin/drives/:id**
Delete drive (soft delete - mark as inactive)

**Auth:** Required (ADMIN)

**Response (200):**
```json
{
  "success": true,
  "message": "Drive deleted successfully"
}
```

---

### **GET /api/admin/drives/:id/applications**
Get all applications for a drive

**Auth:** Required (ADMIN)

**Query Params:**
- `status` (optional): Filter by ApplicationStatus
- `branch` (optional)
- `minCgpa` (optional)
- `search` (optional): Search by name/roll no
- `page`, `limit`

**Response (200):**
```json
{
  "applications": [
    {
      "id": "app123",
      "student": {
        "id": "student123",
        "rollNo": "1BM20CS001",
        "firstName": "John",
        "lastName": "Doe",
        "branch": "CSE",
        "cgpa": 8.5,
        "email": "john@student.bmsce.ac.in",
        "phone": "+919876543210"
      },
      "status": "APPLIED",
      "resumeUrl": "https://...",
      "remarks": null,
      "appliedAt": "2025-10-28T10:30:00Z",
      "updatedAt": "2025-10-28T10:30:00Z"
    }
  ],
  "pagination": { "total": 300, "page": 1, "limit": 50 },
  "stats": {
    "total": 300,
    "byStatus": {
      "APPLIED": 200,
      "SHORTLISTED": 50,
      "OFFER": 15,
      "REJECTED": 35
    }
  }
}
```

---

### **GET /api/admin/drives/:id/export**
Export applications to Excel/CSV

**Auth:** Required (ADMIN)

**Query Params:**
- `format`: "csv" | "excel"
- `status` (optional)

**Response:** File download

**Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="google-sde-intern-applications.xlsx"
```

---

### **POST /api/admin/drives/:id/shortlist**
Upload shortlist (bulk status update)

**Auth:** Required (ADMIN)

**Request (multipart/form-data):**
```
file: <Excel/CSV File>
status: "SHORTLISTED" | "TEST_CLEARED" | "INTERVIEW_SCHEDULED" | "INTERVIEW_CLEARED" | "OFFER" | "REJECTED"
notifyStudents: true (optional, default true)
```

**Excel/CSV Format:**
```csv
rollNo,status,remarks
1BM20CS001,SHORTLISTED,Strong technical profile
1BM20CS002,OFFER,Excellent performance in all rounds
1BM20CS003,REJECTED,Did not clear technical round
```

**Response (200):**
```json
{
  "success": true,
  "updated": 50,
  "failed": 2,
  "errors": [
    {
      "row": 3,
      "rollNo": "1BM20CS999",
      "error": "Student not found or did not apply to this drive"
    },
    {
      "row": 7,
      "rollNo": "1BM20IT042",
      "error": "Invalid status value"
    }
  ],
  "notificationsSent": 50
}
```

---

### **PATCH /api/admin/applications/:id**
Update individual application status

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "status": "INTERVIEW_SCHEDULED",
  "remarks": "Interview on Nov 10, 2PM"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application status updated",
  "notificationSent": true
}
```

---

### **GET /api/admin/events**
List all calendar events

**Auth:** Required (ADMIN)

**Query Params:**
- `driveId` (optional)
- `type` (optional)
- `startDate`, `endDate`
- `page`, `limit`

**Response (200):**
```json
{
  "events": [
    {
      "id": "event123",
      "title": "Google PPT",
      "description": "Pre-placement talk",
      "type": "PPT",
      "startTime": "2025-10-30T14:00:00Z",
      "endTime": "2025-10-30T15:30:00Z",
      "venue": "Hall A",
      "meetingLink": null,
      "drive": {
        "id": "drive123",
        "company": { "name": "Google" },
        "title": "SDE Intern 2025"
      },
      "createdAt": "2025-10-27T10:00:00Z"
    }
  ],
  "pagination": { "total": 25, "page": 1, "limit": 20 }
}
```

---

### **POST /api/admin/events**
Create calendar event

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "title": "Google PPT",
  "description": "Pre-placement talk for SDE role",
  "type": "PPT",
  "startTime": "2025-10-30T14:00:00Z",
  "endTime": "2025-10-30T15:30:00Z",
  "venue": "Hall A",
  "meetingLink": null,
  "driveId": "drive123"
}
```

**Response (201):**
```json
{
  "success": true,
  "event": {
    "id": "event123",
    "title": "Google PPT",
    "startTime": "2025-10-30T14:00:00Z"
  },
  "conflicts": []
}
```

**Response with Conflicts (201 - event created but warnings present):**
```json
{
  "success": true,
  "event": { "id": "event123" },
  "conflicts": [
    {
      "id": "event100",
      "title": "Microsoft Test",
      "startTime": "2025-10-30T14:30:00Z",
      "venue": "Hall A"
    }
  ],
  "warning": "Event overlaps with 1 other event(s)"
}
```

---

### **PATCH /api/admin/events/:id**
Update event

**Auth:** Required (ADMIN)

**Request:** (all fields optional)
```json
{
  "startTime": "2025-10-30T15:00:00Z",
  "venue": "Hall B"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "notificationsSent": 300
}
```

---

### **DELETE /api/admin/events/:id**
Delete event

**Auth:** Required (ADMIN)

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "notificationsSent": 300
}
```

---

### **GET /api/admin/analytics**
Get placement analytics

**Auth:** Required (ADMIN)

**Query Params:**
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date
- `year` (optional): Academic year filter

**Response (200):**
```json
{
  "placement": {
    "totalStudents": 1500,
    "placed": 850,
    "percentage": 56.7,
    "averageCtc": 8.2,
    "medianCtc": 7.5,
    "highestCtc": 45.0,
    "lowestCtc": 3.5
  },
  "byBranch": [
    {
      "branch": "CSE",
      "total": 500,
      "placed": 475,
      "percentage": 95.0,
      "averageCtc": 10.5
    },
    {
      "branch": "IT",
      "total": 400,
      "placed": 368,
      "percentage": 92.0,
      "averageCtc": 9.8
    },
    {
      "branch": "ECE",
      "total": 350,
      "placed": 273,
      "percentage": 78.0,
      "averageCtc": 6.5
    }
  ],
  "byCtcRange": [
    { "range": "0-5L", "count": 170, "percentage": 20.0 },
    { "range": "5-10L", "count": 383, "percentage": 45.0 },
    { "range": "10-20L", "count": 213, "percentage": 25.0 },
    { "range": "20L+", "count": 84, "percentage": 10.0 }
  ],
  "topRecruiters": [
    {
      "company": { "name": "Google", "logo": "https://..." },
      "offers": 15,
      "averageCtc": 18.5
    },
    {
      "company": { "name": "Amazon", "logo": "https://..." },
      "offers": 12,
      "averageCtc": 16.2
    },
    {
      "company": { "name": "Microsoft", "logo": "https://..." },
      "offers": 10,
      "averageCtc": 19.8
    }
  ],
  "timeline": [
    { "month": "2025-08", "offers": 45 },
    { "month": "2025-09", "offers": 120 },
    { "month": "2025-10", "offers": 250 }
  ]
}
```

---

### **GET /api/admin/analytics/export**
Export analytics report

**Auth:** Required (ADMIN)

**Query Params:**
- `format`: "pdf" | "excel"
- `year` (optional)

**Response:** File download

---

### **GET /api/admin/audit-logs**
Get audit trail

**Auth:** Required (ADMIN)

**Query Params:**
- `userId` (optional)
- `action` (optional): AuditAction enum value
- `target` (optional): "Drive" | "Student" | "Application" | etc.
- `targetId` (optional)
- `startDate`, `endDate` (optional)
- `page`, `limit`

**Response (200):**
```json
{
  "logs": [
    {
      "id": "log123",
      "userEmail": "admin@bmsce.ac.in",
      "action": "SHORTLIST_UPLOAD",
      "target": "Drive",
      "targetId": "drive123",
      "meta": {
        "studentsAffected": 50,
        "fileName": "google_shortlist.xlsx",
        "statusUpdated": "SHORTLISTED"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-10-28T15:30:00Z"
    },
    {
      "id": "log124",
      "userEmail": "admin@bmsce.ac.in",
      "action": "DRIVE_PUBLISHED",
      "target": "Drive",
      "targetId": "drive123",
      "meta": {
        "companyName": "Google",
        "eligibleStudents": 450
      },
      "ipAddress": "192.168.1.100",
      "createdAt": "2025-10-27T10:00:00Z"
    }
  ],
  "pagination": { "total": 1250, "page": 1, "limit": 50, "totalPages": 25 }
}
```

---

### **POST /api/admin/notifications/broadcast**
Send mass notification

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "target": "all" | "branch" | "drive" | "eligible" | "placed" | "unplaced",
  "targetIds": ["CSE", "IT"],
  "title": "Urgent: Schedule Change",
  "message": "Google PPT has been rescheduled to Nov 1, 3:00 PM in Hall B.",
  "type": "ANNOUNCEMENT",
  "link": "/student/calendar",
  "sendEmail": true
}
```

**Target Types:**
- `all`: All students
- `branch`: Specific branches (provide branch codes in targetIds)
- `drive`: Students who applied to specific drives (provide driveIds in targetIds)
- `eligible`: Students eligible for specific drives (provide driveIds in targetIds)
- `placed`: Only placed students
- `unplaced`: Only unplaced students

**Response (200):**
```json
{
  "success": true,
  "sent": 500,
  "failed": 2,
  "message": "Notification sent to 500 students",
  "emailsSent": 498,
  "emailsFailed": 2
}
```

---

## 📊 Error Response Format

All errors follow this standard structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {}
}
```

### **Common HTTP Status Codes:**

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Resource retrieved/updated successfully |
| 201 | Created | New resource created |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Not logged in or session expired |
| 403 | Forbidden | Logged in but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry, business logic violation |
| 413 | Payload Too Large | File upload exceeds size limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### **Error Code Examples:**

**401 Unauthorized:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required. Please log in."
}
```

**403 Forbidden:**
```json
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource",
  "details": {
    "requiredRole": "ADMIN",
    "yourRole": "STUDENT"
  }
}
```

**400 Validation Error:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "fields": {
      "cgpa": "CGPA must be between 0 and 10",
      "email": "Invalid email format"
    }
  }
}
```

**404 Not Found:**
```json
{
  "error": "NOT_FOUND",
  "message": "Drive not found",
  "details": {
    "resource": "Drive",
    "id": "drive999"
  }
}
```

**409 Conflict:**
```json
{
  "error": "ALREADY_APPLIED",
  "message": "You have already applied to this drive",
  "details": {
    "applicationId": "app123",
    "appliedAt": "2025-10-28T10:30:00Z"
  }
}
```

**429 Rate Limit:**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "details": {
    "retryAfter": 60,
    "limit": 300,
    "window": "1 minute"
  }
}
```

---

## 🔒 Rate Limiting

Rate limits are applied per IP address for unauthenticated requests and per user for authenticated requests.

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Public (no auth) | 100 requests | 1 minute |
| Authenticated | 300 requests | 1 minute |
| File uploads | 10 uploads | 1 minute |
| Bulk operations | 5 operations | 5 minutes |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 250
X-RateLimit-Reset: 1698765432
```

---

## 📝 Pagination

All list endpoints support pagination with these query parameters:

- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Items per page

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "total": 1500,
    "page": 1,
    "limit": 20,
    "totalPages": 75,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔍 Filtering & Searching

Most list endpoints support filtering and searching:

**Common Filters:**
- `search`: Full-text search across relevant fields
- Date ranges: `startDate`, `endDate`
- Status filters: `status`, `isActive`
- Category filters: `branch`, `sector`, `type`

**Example:**
```
GET /api/admin/students?branch=CSE&minCgpa=8.0&search=john&page=1&limit=50
```

---

## 📤 File Upload Specifications

### **Supported File Types:**

| Document Type | Allowed Extensions | Max Size |
|--------------|-------------------|----------|
| Resume | .pdf | 5 MB |
| Transcript | .pdf | 5 MB |
| Certificate | .pdf, .jpg, .png | 5 MB |
| Company Logo | .jpg, .png, .svg | 2 MB |
| Bulk Data (CSV/Excel) | .csv, .xlsx | 10 MB |

### **Upload Response:**
```json
{
  "success": true,
  "file": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "documents/abc123",
    "format": "pdf",
    "size": 1245678,
    "uploadedAt": "2025-10-28T16:00:00Z"
  }
}
```

---

## 🔔 Notification Types

| Type | Trigger | Recipients |
|------|---------|------------|
| `DRIVE_ADDED` | New drive published | Eligible students |
| `DEADLINE_REMINDER` | 24h before registration closes | Students who haven't applied |
| `SHORTLIST_UPDATE` | Status changed to shortlisted | Affected students |
| `TEST_LINK` | Test link uploaded | Shortlisted students |
| `INTERVIEW_SCHEDULED` | Interview event created | Shortlisted students |
| `OFFER` | Status changed to offer | Student with offer |
| `DRIVE_CANCELLED` | Drive deleted/deactivated | Applied students |
| `EVENT_UPDATED` | Event time/venue changed | Relevant students |
| `ANNOUNCEMENT` | Admin broadcast | Target audience |

---

## 🔐 Security Best Practices

### **Authentication:**
- All passwords are hashed using bcrypt (salt rounds: 12)
- Session tokens expire after 7 days
- Invite tokens expire after 7 days
- Password requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number

### **Authorization:**
- Role-based access control (RBAC)
- Middleware enforces role checks on protected routes
- Students can only access their own data
- Admins have full access with audit logging

### **Data Protection:**
- All API requests use HTTPS in production
- Sensitive data (emails, phone numbers) masked in logs
- Document URLs are signed and expire after 24 hours
- SQL injection prevention via Prisma parameterized queries
- XSS prevention via input sanitization

### **API Security:**
- CSRF protection enabled
- Rate limiting per user/IP
- Request size limits enforced
- File type validation on uploads
- Audit logging for sensitive operations

---

## 🧪 Testing the API

### **Using cURL:**

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"pass123"}'

# Get drives (with session cookie)
curl http://localhost:3000/api/student/drives \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### **Using Postman/Insomnia:**

1. Import this API documentation
2. Set up environment variables:
   - `baseUrl`: http://localhost:3000/api
   - `sessionToken`: (obtained from login)
3. Add cookie header: `next-auth.session-token={{sessionToken}}`

---

## 📚 Related Documentation

- [Database Schema](./docs/DATABASE.md)
- [Authentication Flow](./docs/AUTH.md)
- [Admin Guide](./docs/ADMIN_GUIDE.md)
- [Student Guide](./docs/STUDENT_GUIDE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 🆘 Support

For API issues or questions:
- File an issue on GitHub
- Contact: placement-support@bmsce.ac.in
- API Status: https://status.campusconnect.edu

---

**Last Updated:** October 2025
**Version:** 1.0
**Maintained by:** BMSCE Placement Automation Team
