# 🚀 Deployment Guide - CampusConnect

Deploy your placement portal to production using Vercel (hosting) and Neon (PostgreSQL database).

**Estimated Time:** 20-30 minutes

---

## Prerequisites

Before deploying, make sure you have:
- ✅ GitHub account (to store code)
- ✅ Vercel account (free tier)
- ✅ Neon account (free tier with PostgreSQL)
- ✅ All features tested locally

---

# Step 1: Set Up Neon Database (Free PostgreSQL)

## 1.1 Create Neon Account

1. Go to https://neon.tech
2. Click "Sign Up" (can use GitHub)
3. Verify email

## 1.2 Create Database

1. Click "New Project"
2. Fill details:
   - **Name:** `campusconnect-prod`
   - **Region:** Choose closest to your users (e.g., AWS Asia Pacific Mumbai)
   - **PostgreSQL Version:** 15 or latest
3. Click "Create Project"

## 1.3 Get Connection String

1. On project dashboard, click "Connection Details"
2. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this for later!

**Important:** Keep this secret - never commit to Git!

---

# Step 2: Push Code to GitHub

## 2.1 Initialize Git (if not done)

```bash
git init
git add .
git commit -m "Initial commit - CampusConnect Phase 1 MVP"
```

## 2.2 Create .gitignore

Make sure your `.gitignore` includes:

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Environment Variables
.env
.env.local
.env.production.local
.env.development.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/migrations/**/migration.sql
```

## 2.3 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `college-placement-portal`
3. Description: `Campus placement management system for BMSCE`
4. Privacy: **Private** (recommended for college projects)
5. Click "Create repository"

## 2.4 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/college-placement-portal.git
git branch -M main
git push -u origin main
```

---

# Step 3: Deploy to Vercel

## 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. **Choose "Continue with GitHub"** (easier integration)
4. Authorize Vercel to access your GitHub

## 3.2 Import Project

1. On Vercel dashboard, click "Add New" → "Project"
2. Find your `college-placement-portal` repository
3. Click "Import"

## 3.3 Configure Environment Variables

**IMPORTANT:** Before deploying, add these environment variables:

Click "Environment Variables" and add:

### Variable 1: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```
(Paste the Neon connection string from Step 1.3)

### Variable 2: NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: [Generate a new secret - see below]
```

**To generate NEXTAUTH_SECRET:**
- On Mac/Linux:
  ```bash
  openssl rand -base64 32
  ```
- Or use: https://generate-secret.vercel.app/32
- Copy the generated string

### Variable 3: NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
```
(You'll get this after deployment, can add later)

## 3.4 Deploy

1. Leave build settings as default:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
2. Click "Deploy"

**Wait 2-3 minutes...**

---

# Step 4: Run Database Migrations

After Vercel deploys successfully:

## 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

## 4.2 Login to Vercel

```bash
vercel login
```

## 4.3 Link Your Project

```bash
vercel link
```

Follow prompts:
- Scope: Choose your account
- Link to existing project: Yes
- Project name: `college-placement-portal`

## 4.4 Pull Environment Variables

```bash
vercel env pull .env.production
```

## 4.5 Run Migrations on Production DB

```bash
# Set DATABASE_URL to production
export DATABASE_URL="your-neon-connection-string"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

**Alternative - Using Prisma Studio:**
```bash
# Connect to production DB
DATABASE_URL="your-neon-connection-string" npx prisma studio
```

---

# Step 5: Seed Production Database

## 5.1 Create Admin User

Option A - Using Prisma Studio:
1. Run: `DATABASE_URL="your-neon-connection-string" npx prisma studio`
2. Open browser at http://localhost:5555
3. Go to `User` table
4. Click "Add Record"
5. Fill:
   - email: `admin@bmsce.ac.in`
   - password: (generate hash - see below)
   - role: `ADMIN`
   - isActive: `true`
6. Save

**To generate password hash:**
```bash
node -e "console.log(require('bcrypt').hashSync('your-password', 12))"
```

Option B - Using SQL:
```sql
-- Connect to Neon DB via their SQL Editor
INSERT INTO "User" (id, email, password, role, "isActive")
VALUES (
  'admin-001',
  'admin@bmsce.ac.in',
  '$2b$12$hash-here',  -- Replace with bcrypt hash
  'ADMIN',
  true
);
```

---

# Step 6: Update NEXTAUTH_URL

1. Go to Vercel dashboard
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Edit `NEXTAUTH_URL`
5. Set value to: `https://your-project-name.vercel.app`
6. Click "Save"
7. Redeploy: Go to "Deployments" → Click "..." → "Redeploy"

---

# Step 7: Test Production Site

## 7.1 Access Your Site

Go to: **https://your-project-name.vercel.app**

## 7.2 Test Login

1. Try logging in with admin credentials
2. If successful, you should see admin dashboard

## 7.3 Import Students

1. Go to `/admin/students/import`
2. Upload your student CSV
3. Verify students are created

---

# Step 8: Custom Domain (Optional)

## 8.1 Purchase Domain

Buy a domain from:
- Namecheap
- GoDaddy
- Google Domains

Example: `placements.bmsce.ac.in` (if college allows subdomain)

## 8.2 Add Domain to Vercel

1. In Vercel project, go to "Settings" → "Domains"
2. Click "Add"
3. Enter your domain: `placements.bmsce.ac.in`
4. Click "Add"

## 8.3 Configure DNS

Vercel will show you DNS records to add:

**If using subdomain:**
```
Type: CNAME
Name: placements
Value: cname.vercel-dns.com
```

**If using root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

Go to your domain registrar and add these DNS records.

**Wait 10-60 minutes** for DNS propagation.

## 8.4 Update NEXTAUTH_URL Again

1. In Vercel → Environment Variables
2. Update `NEXTAUTH_URL` to: `https://placements.bmsce.ac.in`
3. Redeploy

---

# Step 9: Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] Admin can login
- [ ] Student import works
- [ ] Companies can be added
- [ ] Drives can be created
- [ ] Database persists data
- [ ] No console errors (F12)
- [ ] Environment variables are set
- [ ] Custom domain working (if added)
- [ ] SSL certificate active (https://)

---

# 🔒 Security Checklist

Before going live:

- [ ] All `.env` files in `.gitignore`
- [ ] Strong `NEXTAUTH_SECRET` (32+ chars)
- [ ] Database credentials not exposed
- [ ] No API keys in frontend code
- [ ] Admin password is strong
- [ ] Rate limiting considered (future)
- [ ] CORS configured properly
- [ ] SQL injection prevented (Prisma ✅)
- [ ] XSS prevented (React ✅)

---

# 🐛 Troubleshooting

## Issue: "Database connection failed"

**Solution:**
1. Check DATABASE_URL in Vercel environment variables
2. Make sure it includes `?sslmode=require`
3. Verify Neon database is active
4. Check if IP whitelist is set (Neon should allow all)

## Issue: "NextAuth configuration error"

**Solution:**
1. Verify NEXTAUTH_SECRET is set
2. Verify NEXTAUTH_URL matches your domain
3. Redeploy after changing env vars

## Issue: "Prisma Client not found"

**Solution:**
Add this to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```
Then redeploy.

## Issue: "Build failed"

**Solution:**
1. Check Vercel build logs
2. Make sure all dependencies are in `package.json`
3. Verify TypeScript has no errors: `npm run build` locally
4. Check Node version (should be 18+)

## Issue: "Students can't access /student routes"

**Solution:**
1. Check middleware.ts is deployed
2. Verify student has isActive=true
3. Check student's role is "STUDENT" not "ADMIN"
4. Clear browser cookies and re-login

---

# 📊 Monitoring

## View Logs

**Vercel Logs:**
1. Go to project → "Logs" tab
2. View real-time requests
3. Filter by errors

**Database Logs:**
1. Go to Neon dashboard
2. Click "Monitoring"
3. View query performance

## Analytics (Optional)

Add Vercel Analytics:
```bash
npm install @vercel/analytics
```

In `src/app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

# 🔄 Continuous Deployment

**Every time you push to GitHub:**
1. Vercel automatically rebuilds
2. Runs `npm run build`
3. Deploys if successful
4. Sends deployment notification

**To deploy manually:**
```bash
vercel --prod
```

---

# 💰 Cost Breakdown (Free Tier Limits)

## Vercel Free Tier:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ Custom domains (1 included)
- ✅ CI/CD included

**Should handle:** ~10,000+ students/month easily

## Neon Free Tier:
- ✅ 1 project
- ✅ 10 branches
- ✅ 3 GB storage
- ✅ Unlimited compute hours
- ✅ Automatic backups

**Should handle:** 5,000-10,000 students, 500+ drives

---

# 📈 Scaling (When You Grow)

**If you exceed free tier:**

**Vercel Pro ($20/month):**
- 1 TB bandwidth
- More deployment minutes
- Team collaboration

**Neon Pro ($19/month):**
- Unlimited storage
- Point-in-time recovery
- Better performance

**Or migrate to:**
- Railway (cheaper alternative)
- Render (generous free tier)
- Self-host on AWS/DigitalOcean

---

# ✅ Deployment Complete!

Your placement portal is now LIVE! 🎉

**Share with users:**
```
🌐 Portal URL: https://your-project.vercel.app
📧 Admin Login: admin@bmsce.ac.in
📝 How to use: [Share TESTING_GUIDE.md]
```

**Monitor for first week:**
- Check error logs daily
- Gather user feedback
- Fix bugs quickly
- Add more sample data if needed

---

**Need help? Check Vercel docs or Neon docs for detailed troubleshooting!**

**Happy Deploying! 🚀**
