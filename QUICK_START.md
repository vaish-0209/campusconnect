# 🚀 CampusConnect - Quick Start Guide

**Last Updated:** October 27, 2025

---

## ⚡ Quick Setup (First Time)

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Setup database
cp .env.example .env.local

# 3. Add your database URL to .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# 4. Run migrations
npm run prisma:generate
npm run prisma:migrate

# 5. Seed database (creates test data)
npm run prisma:seed

# 6. Start dev server
npm run dev
```

Visit: http://localhost:3000

---

## 👤 Test Credentials

### Admin Account
```
Email: admin@bmsce.ac.in
Password: admin123
```

### Student Account
```
Email: student@test.com
Password: student123
```

---

## 🧪 What to Test

### For Students (100% Complete):
1. Login at `/login`
2. View dashboard → See stats and upcoming drives
3. Browse companies → Search for "Google"
4. View drive details → Check eligibility
5. Apply to drive (if eligible)
6. Track applications → See status

### For Admins (85% Complete):
1. Login at `/login`
2. **Students:**
   - View list at `/admin/students`
   - Import CSV at `/admin/students/import`
   - Download template, add 3-5 students, upload
3. **Companies:**
   - Manage at `/admin/companies`
   - Add "Flipkart" or "Amazon"
   - Edit/Delete companies
4. **Drives:** (APIs ready, UI pending)
   - API works, pages not built yet

---

## 📂 Key URLs

### Public:
- `/` - Landing page
- `/login` - Login
- `/setup-password` - Account activation

### Student Portal:
- `/student/dashboard` - Dashboard
- `/student/companies` - Browse drives
- `/student/companies/[id]` - Drive details
- `/student/applications` - Track applications

### Admin Portal:
- `/admin/dashboard` - Dashboard
- `/admin/students` - Student management
- `/admin/students/import` - CSV import
- `/admin/companies` - Company management
- `/admin/drives` - (Coming soon)

---

## 🔧 Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run prisma:studio         # Open database GUI
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run migrations
npm run prisma:seed           # Seed test data

# Linting
npm run lint                  # Run ESLint
```

---

## 📊 Current Features

### ✅ Working Features:
- Login/logout (students + admins)
- Student: Browse drives
- Student: Check eligibility
- Student: Apply to drives
- Student: Track applications
- Admin: View all students
- Admin: Import students (CSV)
- Admin: Manage companies (CRUD)

### ⏳ Coming Soon:
- Admin: Create/manage drives
- Admin: View applications
- Admin: Upload shortlists
- Email notifications
- Document upload
- Analytics dashboard

---

## 🐛 Troubleshooting

### "Database not found"
```bash
npm run prisma:migrate
npm run prisma:seed
```

### "Unauthorized" error
- Make sure you're logged in
- Check if using correct role (student vs admin)
- Try logout and login again

### "Port 3000 already in use"
```bash
# Kill the process or use different port
npm run dev -- -p 3001
```

### CSV import fails
- Make sure CSV has correct column names
- Check for valid email formats
- Ensure no duplicate roll numbers/emails

---

## 📚 Documentation

- [README.md](./README.md) - Project overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Tech stack
- [AUTH_COMPLETE.md](./AUTH_COMPLETE.md) - Authentication
- [STUDENT_PORTAL_COMPLETE.md](./STUDENT_PORTAL_COMPLETE.md) - Student features
- [ADMIN_PORTAL_STATUS.md](./ADMIN_PORTAL_STATUS.md) - Admin progress
- [PROGRESS_REPORT.md](./PROGRESS_REPORT.md) - Overall status

---

## ✅ Quick Test Checklist

- [ ] Can login as student
- [ ] Can view drives as student
- [ ] Can apply to eligible drive
- [ ] Can see application in tracker
- [ ] Can login as admin
- [ ] Can view students list
- [ ] Can import students via CSV
- [ ] Can create a company
- [ ] Can edit/delete company

---

## 🎯 Next Steps

1. **Test everything built so far**
2. **Import your actual student data**
3. **Add real companies**
4. **Ready for drive management** (APIs done, UI pending)

---

## 💡 Pro Tips

1. **Use Prisma Studio** to view/edit database directly:
   ```bash
   npm run prisma:studio
   ```

2. **CSV Import Template** available at `/admin/students/import`

3. **Search works** on students and drives (name, roll no, email)

4. **Filters work** on students (branch, CGPA)

5. **Pagination** - 50 students per page, 10 drives per page

---

## 📞 Need Help?

Check the documentation files listed above. They have:
- Complete API specs
- Database schema
- Security info
- Testing guides
- Troubleshooting

---

**Built with ❤️ for BMSCE**
**Project Status:** 85% Complete
**Time Invested:** ~10 hours total
**Ready for Production:** Student portal + admin student/company management

🚀 **Let's finish the last 15%!**
