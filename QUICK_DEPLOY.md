# ⚡ Quick Deploy Checklist

Follow these steps to deploy in **10 minutes**:

---

## ✅ Step 1: Push to GitHub (2 min)

```bash
# Initialize git
git init
git add .
git commit -m "Ready for production deployment"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/college-placement.git
git push -u origin main
```

---

## ✅ Step 2: Deploy to Vercel (5 min)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your **college-placement** repository
4. **Add these environment variables**:

```env
DATABASE_URL=postgresql://neondb_owner:WIDZFnGdqK9Y@ep-old-truth-ad4ez43b-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_SECRET=generate-new-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

CLOUDINARY_CLOUD_NAME=dcdjnsloj
CLOUDINARY_API_KEY=583157967452977
CLOUDINARY_API_SECRET=cQJ127iYRfHLRoIc3ufND1ky2Jk

UPSTASH_REDIS_REST_URL=https://summary-glider-18501.upstash.io
UPSTASH_REDIS_REST_TOKEN=AUhFAAIncDI5NDc3OWY4N2RkYjE0YmNhYTUxNDc2YzY3NzM3MmVmY3AyMTg1MDE

RESEND_API_KEY=re_eAkZvhkH_CmFEJsBgfwuh5jsJZ8c9HEhV
EMAIL_FROM=BMSCE Placements <placements@yourdomain.com>

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**
- Windows PowerShell: Run this Node command:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- Or use: https://generate-secret.vercel.app/32

5. Click **"Deploy"** → Wait 2-3 minutes

---

## ✅ Step 3: Update NEXTAUTH_URL (1 min)

After deployment:

1. Copy your Vercel URL (e.g., `https://college-placement-abc123.vercel.app`)
2. Go to **Vercel → Settings → Environment Variables**
3. Update **NEXTAUTH_URL** to your actual Vercel URL
4. Go to **Deployments** → Click **"..."** → **"Redeploy"**

---

## ✅ Step 4: Your Database is Already Ready! (0 min)

Your PostgreSQL database is already:
- ✅ Seeded with 20 students
- ✅ Has 9 companies
- ✅ Has 25 placement drives
- ✅ Has 60 calendar events
- ✅ Has 98 applications with realistic data

**Default Admin Login:**
- Email: `admin@bmsce.ac.in`
- Password: `admin123`

⚠️ **IMPORTANT:** Change this password after first login!

---

## ✅ Step 5: Test Your Site (2 min)

1. Visit your Vercel URL
2. Login with admin credentials
3. Check:
   - ✅ Dashboard loads
   - ✅ Students list appears
   - ✅ Companies are visible
   - ✅ Drives are showing
   - ✅ Calendar has events

---

## 🎉 You're Live!

Your app is now deployed at: **https://your-app.vercel.app**

### What's Working:
- ✅ PostgreSQL database (Neon)
- ✅ File uploads (Cloudinary)
- ✅ Rate limiting (Upstash Redis)
- ✅ Email notifications (Resend)
- ✅ Error tracking (Sentry - optional)
- ✅ Auto deployments on git push

---

## 🔄 To Update Your Site

Just push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically redeploy in ~2 minutes!

---

## 🐛 Quick Troubleshooting

### Can't login?
- Check `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your Vercel URL
- Clear browser cookies

### Database errors?
- Verify `DATABASE_URL` is correct
- Must include `?sslmode=require`

### Build fails?
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Run `npm run build` locally first

---

## 📞 Need More Help?

See the full deployment guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Happy Deploying! 🚀**
