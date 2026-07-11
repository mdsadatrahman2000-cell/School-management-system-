# Deployment Guide

## Overview

This guide covers deploying the School Management System to production using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase (PostgreSQL)

## Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- Supabase account (free)

---

## Step 1: Supabase (Database)

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Enter project name: `school-mgmt`
5. Set database password (save this!)
6. Choose region closest to your users
7. Click "Create new project"

### 1.2 Get Connection String
1. Go to Settings → Database
2. Copy the connection string (URI format)
3. Replace `[YOUR-PASSWORD]` with your actual password

Example:
```
postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
```

---

## Step 2: Render (Backend)

### 2.1 Push Code to GitHub
```bash
cd school-management-system
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/school-management-system.git
git push -u origin main
```

### 2.2 Create Web Service
1. Go to [render.com](https://render.com)
2. Sign up / Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name**: `school-mgmt-api`
   - **Runtime**: Node
   - **Region**: Oregon (or closest)
   - **Plan**: Free
   - **Build Command**: `cd apps/api && npm install && npx prisma generate && npm run build`
   - **Start Command**: `cd apps/api && npm start`
   - **Health Check Path**: `/health`

### 2.3 Set Environment Variables
Add these in Render dashboard:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `JWT_SECRET` | Random 32+ character string |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your Vercel URL (update after Step 3) |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

### 2.4 Deploy
Click "Create Web Service" and wait for deployment.

---

## Step 3: Vercel (Frontend)

### 3.1 Import Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up / Login with GitHub
3. Click "Import Project"
4. Select your repo
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.2 Set Environment Variables
Add these in Vercel dashboard:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com/api/v1` |

### 3.3 Deploy
Click "Deploy" and wait for deployment.

---

## Step 4: Final Configuration

### 4.1 Update Render CORS
1. Go to Render dashboard
2. Update `FRONTEND_URL` environment variable
3. Set it to your Vercel URL: `https://your-app.vercel.app`
4. Redeploy the service

### 4.2 Run Database Migration
1. Go to Render dashboard
2. Open Shell tab
3. Run:
```bash
cd apps/api
npx prisma migrate deploy
npx tsx prisma/seed.js
```

---

## Step 5: Test

1. Open your Vercel URL
2. Try logging in with:
   - Email: `admin@schoolacademy.com`
   - Password: `Admin@123`

---

## Custom Domain (Optional)

### Vercel
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as shown

### Render
1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records as shown

---

## Environment Variables Reference

### Backend (Render)
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=10000
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1
```

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in Render
- Include `https://` in the URL

### Database Connection Failed
- Verify Supabase connection string
- Check if IP is whitelisted (Supabase → Settings → Database → Network)

### Build Failures
- Check build logs in Render/Vercel dashboard
- Ensure all dependencies are in package.json

---

## Cost Summary

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | ✅ 100GB bandwidth | $20/mo |
| Render | ✅ 750 hours | $7/mo |
| Supabase | ✅ 500MB DB | $25/mo |
| **Total** | **$0/month** | **$7-32/month** |
