# Admin Account Setup Guide

## 🎯 How to Create the First Admin Account

### Method 1: Database Seeding (Recommended)

**This creates the default admin account automatically.**

1. Run the seed command:
   ```bash
   npm run db:seed
   # or
   npx prisma db seed
   ```

2. This creates an admin account with:
   - **Email:** `admin@bmsce.ac.in`
   - **Password:** `admin123`

3. Login at: `http://localhost:3001/login`

4. **⚠️ IMPORTANT:** Change the default password immediately after first login!

---

### Method 2: Manual Database Entry

If you prefer to create a custom admin account:

1. Generate a bcrypt hash for your password:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123', 12).then(h => console.log(h));"
   ```

2. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```

3. Go to the `User` table and click "Add record"

4. Fill in:
   - `email`: Your admin email (e.g., `placement@bmsce.ac.in`)
   - `password`: The hash from step 1
   - `role`: Select `ADMIN`
   - `isActive`: Check the box (set to true)

5. Save and login with your email and password

---

## 👨‍💼 Adding More Admins (After First Admin is Created)

Once you have the first admin account:

1. Login to admin dashboard
2. Go to **Students** section
3. Use the interface to add new users
4. Or create an "Add Admin" feature in the admin panel (recommended for production)

---

## 👨‍🎓 Student Accounts Setup

Students are added by admins through:

1. **Bulk Import:** Upload CSV/Excel with student data
2. **Individual Add:** Manually add students one by one

**Student Login Flow:**
1. Admin imports student data
2. Student receives email with setup link
3. Student clicks link → sets new password via `/setup-password?token=xyz`
4. Student logs in with new password

**Default student password (when seeded):** `student123`

---

## 🔐 Security Best Practices

1. **Change default passwords immediately** after seeding
2. **Use strong admin passwords** (min 8 chars, uppercase, lowercase, numbers)
3. **Don't share admin credentials** - create separate admin accounts for each administrator
4. **Disable or delete** the seed admin account in production
5. **Use environment-specific passwords** - never use `admin123` in production

---

## 🚀 Production Deployment

For production environments:

1. **Don't run the seed script** - it creates test data
2. **Manually create the first admin** using Method 2 above
3. **Set strong environment variables:**
   ```env
   NEXTAUTH_SECRET="your-very-long-random-secret-key-here"
   NEXTAUTH_URL="https://yourproductionurl.com"
   DATABASE_URL="your-production-database-url"
   ```
4. **Enable 2FA** for admin accounts (future enhancement)

---

## 📝 Current Default Credentials (Development Only)

**These are created by `npm run db:seed`:**

**Admin:**
- Email: `admin@bmsce.ac.in`
- Password: `admin123`

**Sample Students:**
- Email: `rahul@student.com`, `priya@student.com`, etc.
- Password: `student123` (for all)

**⚠️ These credentials are for development/testing only. Never use in production!**
