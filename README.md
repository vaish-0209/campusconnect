# 🎓 CampusConnect - Smart Placement Management Portal

> A modern, transparent, and efficient platform for managing campus placements at BMSCE and similar colleges.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)

---

## 🎯 Problem Statement

The current campus placement process is **chaotic and opaque**. Students face:

- ❌ Late or incomplete information about companies and drives
- ❌ Fragmented communication (WhatsApp, Excel, Google Forms)
- ❌ Unclear eligibility criteria and scheduling conflicts
- ❌ No unified view of application status
- ❌ Missed deadlines and opportunities

**Placement cells struggle with:**
- Manual coordination and announcements
- Scattered data across multiple tools
- No real-time analytics or reports
- Difficulty managing schedules and shortlists

---

## ✅ Solution

**CampusConnect** provides a **single, centralized platform** where:

### For Students:
- 🏢 Browse all placement drives with complete JD, CTC, and eligibility
- ✅ Auto-check eligibility before applying
- 📊 Track application status in real-time (Applied → Test → Interview → Offer)
- 📅 View unified placement calendar with all events
- 🔔 Receive timely notifications and reminders
- 📁 Manage documents (resumes, transcripts) in one place

### For Placement Cell:
- 🚀 Publish drives with standardized JD templates
- 👥 Upload student data via CSV and send invite emails
- 🎯 Set eligibility rules (CGPA, branch, backlogs)
- 📤 Upload shortlists and auto-update student statuses
- 📊 View real-time analytics (placement %, average CTC, etc.)
- 📧 Send mass notifications to targeted student groups
- 🔍 Full audit trail of all operations

---

## 🚀 Features

### Phase 1 (MVP)

#### Student Portal
- ✅ Dashboard with quick stats and upcoming drives
- ✅ Company listings with filters and search
- ✅ Eligibility checker (auto-show eligible drives only)
- ✅ One-click application submission
- ✅ Application tracker with status pipeline
- ✅ Placement calendar (PPT, tests, interviews)
- ✅ Document vault (upload multiple resume versions)
- ✅ In-app + email notifications
- ✅ Profile management (CGPA, skills, photo)

#### Admin Dashboard
- ✅ Student management (CSV import + invite system)
- ✅ Company CRUD operations
- ✅ Drive creation with JD form and eligibility rules
- ✅ Shortlist upload (Excel → auto-update statuses)
- ✅ Calendar scheduler with conflict detection
- ✅ Analytics dashboard (placement stats, CTC ranges, top recruiters)
- ✅ Mass notification system (email + in-app)
- ✅ Audit logs (track all sensitive operations)
- ✅ Export reports (CSV/PDF)

### Phase 2 (Future)
- 🔮 Recruiter portal (companies post drives directly)
- 🔮 AI-powered drive recommendations
- 🔮 Prep section (curated questions, alumni tips)
- 🔮 Feedback & ratings for companies
- 🔮 Mobile app (React Native)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with SSR/SSG
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Rapid, modern styling
- **shadcn/ui** - Accessible, customizable components
- **React Hook Form + Zod** - Form validation

### Backend
- **Next.js API Routes** - Serverless backend
- **Prisma ORM** - Type-safe database queries
- **PostgreSQL** - Robust relational database

### Authentication
- **NextAuth.js** - Secure email/password authentication

### Infrastructure
- **Vercel** - Frontend + API hosting (free tier)
- **Neon** - Serverless PostgreSQL (free tier)
- **Cloudinary** - File storage & CDN (free tier)
- **Resend** - Email notifications (free tier)

### Testing
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────┐
│           FRONTEND (Next.js 14)             │
│  Student Portal  |  Admin Dashboard         │
└─────────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────┐
│         API LAYER (Next.js API Routes)      │
│  Authentication + Authorization + Logging   │
└─────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌─────────┐
│ PostgreSQL   │ │Cloudinary│ │ Resend  │
│   (Neon)     │ │ (Files)  │ │ (Email) │
└──────────────┘ └──────────┘ └─────────┘
```

---

## 📁 Project Structure

```
college_placement/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Login, signup
│   │   ├── (student)/         # Student portal
│   │   ├── (admin)/           # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # shadcn components
│   │   ├── student/           # Student-specific
│   │   └── admin/             # Admin-specific
│   ├── lib/                   # Utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── eligibility.ts     # Eligibility checker
│   │   └── audit.ts           # Audit logging
│   ├── emails/                # Email templates
│   └── middleware.ts          # Route protection
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── tests/                     # Unit, integration, E2E tests
├── docs/                      # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── PRISMA_SCHEMA.md
│   ├── ARCHITECTURE.md
│   └── ...
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon account)
- Cloudinary account (free tier)
- Resend account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/college_placement.git
cd college_placement

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your credentials:
# DATABASE_URL="postgresql://..."
# NEXTAUTH_SECRET="..."
# CLOUDINARY_URL="..."
# RESEND_API_KEY="..."

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Credentials

**Admin:**
- Email: `admin@bmsce.ac.in`
- Password: `admin123`

**Test Student:**
- Email: `student@test.com`
- Password: `student123`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [API Documentation](./API_DOCUMENTATION.md) | Complete API reference with all endpoints |
| [Database Schema](./PRISMA_SCHEMA.md) | Prisma schema + ER diagram + common queries |
| [Architecture](./ARCHITECTURE.md) | System design, tech stack, design patterns |
| [Authentication](./docs/AUTH.md) | Auth flow, security, session management |
| [Admin Guide](./docs/ADMIN_GUIDE.md) | How to use the admin dashboard |
| [Student Guide](./docs/STUDENT_GUIDE.md) | How students use the platform |
| [Deployment](./docs/DEPLOYMENT.md) | Deploy to Vercel + Neon |
| [Security](./docs/SECURITY.md) | Security best practices |

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Push to main branch for auto-deploy
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

---

## 📊 Database Schema

### Core Tables

- **User** - Authentication (students + admins)
- **Student** - Extended student profile
- **Company** - Company master data
- **Drive** - Placement drives with eligibility rules
- **Application** - Student-drive mapping (many-to-many)
- **Event** - Calendar events (PPT, tests, interviews)
- **Document** - Resume vault
- **Notification** - In-app notifications
- **AuditLog** - Audit trail for sensitive operations

See [PRISMA_SCHEMA.md](./PRISMA_SCHEMA.md) for complete schema.

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT-based session management (7-day expiry)
- ✅ Role-based access control (RBAC)
- ✅ Route protection via middleware
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React + sanitization)
- ✅ Rate limiting (300 req/min per user)
- ✅ HTTPS-only in production
- ✅ Audit logging for sensitive operations
- ✅ Secure file uploads (type + size validation)

---

## 📈 Performance

- ⚡ **Server-Side Rendering** for fast initial page loads
- ⚡ **Static Generation** for public pages
- ⚡ **Code Splitting** per route (Next.js)
- ⚡ **Database Indexes** on frequently queried fields
- ⚡ **Connection Pooling** (Prisma + Neon)
- ⚡ **CDN Caching** (Vercel Edge + Cloudinary)
- ⚡ **Image Optimization** (Next.js Image + Cloudinary)
- ⚡ **Lazy Loading** for notifications and long lists

---

## 🎯 Success Metrics

### Students
- ✅ 100% drives announced with complete JD at least 7 days in advance
- ✅ 90% reduction in missed deadlines
- ✅ Single dashboard for all placement activities
- ✅ Real-time application status tracking

### Placement Cell
- ✅ 50% fewer student queries per drive
- ✅ Automated eligibility checking
- ✅ One-click shortlist uploads
- ✅ Real-time analytics and reports
- ✅ Full audit trail for compliance

---

## 🛣️ Roadmap

### ✅ Phase 1 (MVP) - Weeks 1-6
- [x] Project setup + database schema
- [x] Authentication system
- [x] Student portal (dashboard, drives, applications)
- [x] Admin dashboard (students, companies, drives)
- [x] Calendar + Events
- [x] Notifications (in-app + email)
- [x] Document vault
- [x] Analytics dashboard
- [x] Audit logging
- [x] Deployment

### 🔜 Phase 2 - Weeks 7-10
- [ ] Recruiter portal
- [ ] Advanced analytics (charts, exports)
- [ ] Email template customization
- [ ] Mobile responsiveness improvements
- [ ] Performance optimization

### 🔮 Phase 3 - Future
- [ ] AI-powered recommendations
- [ ] Prep section (questions, tips)
- [ ] Company ratings & feedback
- [ ] Alumni integration
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**BMSCE Placement Automation Team**

- Product Owner: Placement Cell, BMSCE
- Tech Lead: [Your Name]
- Developers: [Team Members]

---

## 📧 Support

For issues, questions, or feature requests:

- 📧 Email: placement-support@bmsce.ac.in
- 🐛 GitHub Issues: [github.com/your-org/college_placement/issues](https://github.com/your-org/college_placement/issues)
- 📚 Documentation: [/docs](./docs/)

---

## 🙏 Acknowledgments

- BMSCE Placement Cell for the requirements
- Open-source community for amazing tools
- All contributors to this project

---

## 📊 Project Stats

- **Lines of Code:** ~15,000+
- **API Endpoints:** 40+
- **Database Tables:** 9
- **Test Coverage:** 80%+ (target)
- **Expected Users:** 1,500-2,500 students
- **Expected Load:** ~10,000 requests/day

---

<div align="center">

**Built with ❤️ for BMSCE**

⭐ **Star this repo if you find it helpful!** ⭐

</div>
