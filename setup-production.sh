#!/bin/bash

# Production Setup Script for College Placement Portal
# This script installs all necessary production dependencies

echo "🚀 Setting up production dependencies..."

# File Storage - Cloudinary
echo "📁 Installing Cloudinary..."
npm install cloudinary multer

# Rate Limiting - Upstash
echo "🔒 Installing Upstash Redis & Rate Limiting..."
npm install @upstash/redis @upstash/ratelimit

# Email Service - Resend
echo "📧 Installing Resend..."
npm install resend

# Error Monitoring - Sentry
echo "🐛 Installing Sentry..."
npm install @sentry/nextjs

# Alternative: Nodemailer (if not using Resend)
# npm install nodemailer @types/nodemailer

# Alternative: AWS S3 (if not using Cloudinary)
# npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

echo "✅ All production dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Fill in your API keys and credentials"
echo "3. Run: npm run build"
echo "4. Run: npm start"
echo ""
echo "For PostgreSQL migration:"
echo "1. Update DATABASE_URL in .env"
echo "2. Run: npx prisma generate"
echo "3. Run: npx prisma db push"
echo "4. Run seed scripts to populate data"
