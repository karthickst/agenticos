# 🚀 Deployment Guide

This guide covers deploying the Agentic Operation System to production using Vercel for the frontend and Railway/Render for the backend.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Vercel Postgres)](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment (Vercel)](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ [Vercel account](https://vercel.com/signup)
- ✅ [Railway account](https://railway.app/) OR [Render account](https://render.com/)
- ✅ [Anthropic API key](https://console.anthropic.com/settings/keys)
- ✅ GitHub repository with your code
- ✅ Git installed locally

---

## Database Setup (Vercel Postgres)

### 1. Create Vercel Postgres Database

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd /path/to/goagenticos
vercel link

# Create Postgres database
vercel postgres create
```

### 2. Get Database Connection String

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Postgres**
3. Select your database
4. Click on **.env.local** tab
5. Copy the `POSTGRES_URL` value

### 3. Run Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-postgres-url-from-vercel"

# Navigate to backend
cd backend

# Run migrations
sqlx migrate run
```

---

## Backend Deployment

You have two options for deploying the Rust backend:

### Option A: Railway (Recommended)

#### 1. Install Railway CLI

```bash
# macOS
brew install railway

# Or use npm
npm i -g @railway/cli
```

#### 2. Deploy

```bash
# Login to Railway
railway login

# Navigate to backend directory
cd backend

# Initialize Railway project
railway init

# Add environment variables
railway variables set DATABASE_URL="your-vercel-postgres-url"
railway variables set JWT_SECRET="your-secure-jwt-secret-min-32-chars"
railway variables set ANTHROPIC_API_KEY="sk-ant-your-key"
railway variables set RUST_LOG="info"
railway variables set PORT="3001"

# Deploy
railway up
```

#### 3. Get Backend URL

```bash
# Get your deployed URL
railway domain
```

The output will be something like: `https://your-app.railway.app`

### Option B: Render

#### 1. Create Account

Sign up at [Render.com](https://render.com)

#### 2. Create New Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Select the `backend` directory
4. Configure:
   - **Name**: goagenticos-backend
   - **Environment**: Docker
   - **Dockerfile Path**: backend/Dockerfile
   - **Instance Type**: Free or Starter

#### 3. Add Environment Variables

In Render dashboard, add:

```
DATABASE_URL=your-vercel-postgres-url
JWT_SECRET=your-secure-jwt-secret-min-32-chars
ANTHROPIC_API_KEY=sk-ant-your-key
RUST_LOG=info
PORT=3001
```

#### 4. Deploy

Click **Create Web Service**. Render will build and deploy automatically.

### Option C: Docker Compose (Self-Hosted)

```bash
# Create .env file at project root
cp .env.example .env

# Edit .env with your values
nano .env

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## Frontend Deployment (Vercel)

### 1. Install Vercel CLI (if not already)

```bash
npm i -g vercel
```

### 2. Deploy Frontend

```bash
# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables

In [Vercel Dashboard](https://vercel.com/dashboard):

1. Select your project
2. Go to **Settings** → **Environment Variables**
3. Add:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_LOG_LEVEL=info
RUST_API_URL=https://your-backend.railway.app
```

4. Click **Save**
5. Trigger a new deployment: **Deployments** → **Redeploy**

### 4. Alternative: Deploy via Git

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your repository
4. Vercel will auto-detect Next.js
5. Add environment variables (same as above)
6. Click **Deploy**

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Vercel Postgres connection string | ✅ | `postgres://default:xxx@...` |
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) | ✅ | `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | Claude API key | ✅ | `sk-ant-api03-...` |
| `RUST_LOG` | Logging level | ❌ | `info` (default) |
| `PORT` | Server port | ❌ | `3001` (default) |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | ❌ | `https://app.vercel.app` |

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ | `https://backend.railway.app/api/v1` |
| `NEXT_PUBLIC_LOG_LEVEL` | Client-side log level | ❌ | `info` (default) |
| `RUST_API_URL` | Backend base URL for rewrites | ❌ | `https://backend.railway.app` |

---

## Post-Deployment

### 1. Verify Backend Health

```bash
curl https://your-backend.railway.app/api/v1/health
```

Expected response:
```json
{"status": "healthy"}
```

### 2. Test Frontend

Visit your Vercel URL: `https://your-app.vercel.app`

### 3. Test Full Flow

1. **Sign up** for a new account
2. **Create a project**
3. **Add a domain**
4. **Create a requirement**
5. **Generate specification** with Claude

### 4. Monitor Logs

**Backend (Railway):**
```bash
railway logs
```

**Frontend (Vercel):**
- Go to Vercel Dashboard → Your Project → Deployments → View Function Logs

### 5. Set Up Custom Domain (Optional)

**Frontend:**
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Backend:**
1. Railway/Render Dashboard → Your Service → Settings → Custom Domain
2. Add your custom domain

---

## Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
# Railway
railway logs

# Render
# Check logs in Render dashboard

# Docker
docker-compose logs backend
```

**Common issues:**
- ❌ Missing `DATABASE_URL` - Add in environment variables
- ❌ Database migration failed - Run `sqlx migrate run` manually
- ❌ Port already in use - Change `PORT` environment variable

### Frontend Can't Connect to Backend

**Check:**
1. ✅ `NEXT_PUBLIC_API_URL` is set correctly
2. ✅ Backend is running and healthy
3. ✅ CORS is configured (check backend `ALLOWED_ORIGINS`)
4. ✅ Network tab in browser dev tools for actual error

**Test backend directly:**
```bash
curl https://your-backend.railway.app/api/v1/health
```

### Database Connection Issues

**Verify connection string:**
```bash
# Test connection
psql "your-database-url"

# Or with sqlx
sqlx database ping --database-url "your-database-url"
```

**Common issues:**
- ❌ SSL required - Ensure `?sslmode=require` at end of URL
- ❌ Firewall blocking - Check Vercel Postgres firewall settings
- ❌ Wrong credentials - Regenerate from Vercel dashboard

### 422 Errors on Requirement Creation

**Check:**
1. Frontend logs: `tail -f frontend/logs/frontend.log`
2. Backend logs for validation errors
3. Ensure Gherkin has valid keywords (Given/When/Then/And/But)

### Claude Specification Generation Fails

**Check:**
1. ✅ `ANTHROPIC_API_KEY` is set correctly
2. ✅ API key has sufficient credits
3. ✅ Backend logs: `railway logs | grep -i claude`
4. ✅ Job status in database

---

## Production Checklist

Before going live:

- [ ] Database migrations run successfully
- [ ] All environment variables configured
- [ ] Backend health check passing
- [ ] Frontend loads without errors
- [ ] User registration/login works
- [ ] Project creation works
- [ ] Requirement creation works
- [ ] Claude specification generation works
- [ ] Logs are being captured
- [ ] Error monitoring set up (optional: Sentry)
- [ ] Custom domain configured (optional)
- [ ] SSL certificates valid
- [ ] CORS configured for production domains

---

## Quick Deploy Commands

### Full Deployment from Scratch

```bash
# 1. Database
vercel postgres create
export DATABASE_URL="your-vercel-postgres-url"
cd backend && sqlx migrate run && cd ..

# 2. Backend (Railway)
cd backend
railway init
railway variables set DATABASE_URL="$DATABASE_URL"
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set ANTHROPIC_API_KEY="your-key"
railway up
export BACKEND_URL=$(railway domain)
cd ..

# 3. Frontend (Vercel)
cd frontend
vercel --prod
# Set environment variables in Vercel dashboard
cd ..

# 4. Verify
curl $BACKEND_URL/api/v1/health
```

---

## Support

- **Documentation**: See README.md
- **Logs**: See LOGGING.md
- **Issues**: Create GitHub issue

---

**Last Updated**: 2026-02-08
**Version**: 1.0
