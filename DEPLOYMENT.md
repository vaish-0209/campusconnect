# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Vercel Postgres, Supabase, or Neon)

## Step-by-Step Deployment

### 1. Set Up PostgreSQL Database

Choose one of these free options:

#### Option A: Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database" → "Postgres"
3. Copy the `DATABASE_URL` connection string

#### Option B: Supabase
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection String
4. Copy the connection pooler string (use transaction mode)

#### Option C: Neon
1. Go to [Neon](https://neon.tech)
2. Create new project
3. Copy the connection string

### 2. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:

**Required Environment Variables:**
```
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=https://your-app-name.vercel.app
AUTH_TRUST_HOST=true
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

5. Click "Deploy"

### 4. Run Database Migration

After first deployment:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login and link project:
```bash
vercel login
vercel link
```

3. Run migration:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

4. Seed the database (optional):
```bash
npx prisma db seed
```

### 5. Access Your App

Your app will be live at: `https://your-app-name.vercel.app`

**Default Admin Login:**
- Email: admin@bmsce.ac.in
- Password: admin123

**Test Student Login:**
- Email: rahul@student.com
- Password: student123

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Generated with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | `https://your-app.vercel.app` |
| `AUTH_TRUST_HOST` | Trust host header | `true` |

## Post-Deployment

### Update Admin Password
1. Login with default credentials
2. Navigate to Admin Profile
3. Change password immediately

### Add Students
1. Go to Admin → Students
2. Click "Add Student" or "Bulk Import"
3. Send invitation emails

### Configure Email (Optional)
To enable email notifications:

1. Sign up for [Resend](https://resend.com)
2. Add environment variables:
```
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Ensure connection pooling is enabled

### Build Failures
- Check all environment variables are set
- Verify `prisma generate` runs during build
- Review build logs in Vercel dashboard

### Authentication Issues
- Ensure `NEXTAUTH_URL` matches your domain
- Verify `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

## Maintenance

### Database Backups
- Vercel Postgres: Automatic backups included
- Supabase: Daily backups in free tier
- Neon: Point-in-time recovery available

### Monitoring
- Check Vercel Analytics for usage stats
- Monitor database usage in provider dashboard
- Review Audit Logs in admin portal

## Support

For issues or questions:
1. Check the [Next.js Documentation](https://nextjs.org/docs)
2. Review [Prisma Documentation](https://www.prisma.io/docs)
3. Visit [Vercel Support](https://vercel.com/support)
