# 🚀 How to Start the Website - Quick Guide

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js (v18.20.8 or higher)
- ✅ PostgreSQL database running
- ✅ Code editor (VS Code recommended)

---

## Step 1: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
We're using Next.js 16 with Node 18, which requires this flag.

**Expected time:** 2-3 minutes

---

## Step 2: Set Up Environment Variables

Create a `.env` file in the root folder:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/campusconnect"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Replace:**
- `username` - Your PostgreSQL username
- `password` - Your PostgreSQL password
- `campusconnect` - Database name (create it first!)

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or just use: `mysecretkey123` for local testing

---

## Step 3: Create Database

Make sure PostgreSQL is running, then create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE campusconnect;

# Exit
\q
```

---

## Step 4: Run Prisma Migrations

This creates all the tables in your database:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Database migrations applied
```

---

## Step 5: Seed the Database (Optional but Recommended)

Add test data to your database:

```bash
npm run prisma:seed
```

**This creates:**
- 1 Admin user (admin@bmsce.ac.in / admin123)
- 1 Test student (student@test.com / student123)
- 3 Companies (Google, Microsoft, Amazon)
- 1 Sample drive

**If seed script doesn't exist yet, skip this step.**

---

## Step 6: Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

## Step 7: Access the Website

Open your browser and go to:

### **http://localhost:3000**

You should see the login page!

---

## 🎯 Test Credentials

### Admin Login:
```
Email: admin@bmsce.ac.in
Password: admin123
```

**Access:**
- `/admin/dashboard` - Overview stats
- `/admin/students` - Manage students
- `/admin/students/import` - Import via CSV
- `/admin/companies` - Manage companies
- `/admin/drives` - Manage placement drives
- `/admin/drives/new` - Create new drive

### Student Login (if seeded):
```
Email: student@test.com
Password: student123
```

**Access:**
- `/student/dashboard` - Personal dashboard
- `/student/companies` - Browse drives
- `/student/applications` - Track applications

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Port 3000 already in use"
```bash
# Find and kill the process
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Issue 2: "Database connection failed"
```bash
# Check if PostgreSQL is running
# Windows:
services.msc  # Look for PostgreSQL service

# Mac:
brew services list

# Linux:
sudo service postgresql status

# Restart if needed
sudo service postgresql restart
```

### Issue 3: "Prisma Client not generated"
```bash
npx prisma generate
```

### Issue 4: "Migration failed"
```bash
# Reset database (⚠️ deletes all data!)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev
```

### Issue 5: "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 🔧 Useful Commands

### Development:
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
```

### Database:
```bash
npx prisma studio        # Open database GUI (browser)
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma db push       # Push schema without migrations
npx prisma db seed       # Seed database
```

### View Database in Browser:
```bash
npx prisma studio
```
Opens at **http://localhost:5555** - Visual database editor!

---

## 📁 Project Structure

```
college_placement/
├── src/
│   ├── app/                    # Pages and routes
│   │   ├── (auth)/            # Login, signup pages
│   │   ├── (student)/         # Student portal
│   │   ├── (admin)/           # Admin portal
│   │   └── api/               # API endpoints
│   ├── lib/                   # Utilities
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Database client
│   │   └── eligibility.ts     # Eligibility logic
│   └── middleware.ts          # Route protection
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (if exists)
├── .env                       # Environment variables
└── package.json               # Dependencies
```

---

## 🎓 First Time Setup (Complete Flow)

**Run these commands in order:**

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Create .env file (use template above)
code .env

# 3. Generate Prisma Client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed database (if seed file exists)
npm run prisma:seed

# 6. Start server
npm run dev
```

**Total time: ~5 minutes**

---

## 🌐 Access Points

Once running, you can access:

| URL | Purpose | Login Required |
|-----|---------|----------------|
| http://localhost:3000 | Login page | No |
| http://localhost:3000/student/dashboard | Student portal | Yes (Student) |
| http://localhost:3000/admin/dashboard | Admin portal | Yes (Admin) |
| http://localhost:5555 | Prisma Studio (DB viewer) | No |

---

## 📊 Verify Installation

After starting, check these:

1. **Home page loads** → http://localhost:3000
2. **Login works** → Use admin@bmsce.ac.in / admin123
3. **Database has data** → Open Prisma Studio: `npx prisma studio`
4. **No console errors** → Check browser DevTools (F12)

---

## 🆘 Still Having Issues?

1. **Check Node version:**
   ```bash
   node --version  # Should be 18.20.8 or higher
   ```

2. **Check PostgreSQL version:**
   ```bash
   psql --version  # Should be 12+ or higher
   ```

3. **View logs:**
   - Terminal shows server logs
   - Browser console (F12) shows client errors

4. **Database connection test:**
   ```bash
   npx prisma db pull  # Should connect without errors
   ```

---

## 🎉 You're All Set!

If you see the login page at http://localhost:3000, you're ready to go!

**Next steps:**
1. Login as admin
2. Import students via CSV
3. Create placement drives
4. Test student flow

**Need help?** Check the TESTING_GUIDE.md for detailed test scenarios!

---

**Happy Coding! 🚀**
