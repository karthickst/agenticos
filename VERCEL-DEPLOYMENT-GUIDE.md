# 🚀 Vercel Deployment Guide

Complete guide to deploy GoAgenticOS to Vercel with a Rust backend.

## Overview

- **Frontend**: Deployed to Vercel (Next.js)
- **Backend**: Deployed to Railway/Render/Fly.io (Rust/Axum)
- **Database**: Vercel Postgres or Neon

---

## Quick Start (5 minutes)

### 1. Deploy Backend First

#### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Set environment variables
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set ANTHROPIC_API_KEY="your-anthropic-key-here"
railway variables set RUST_LOG="info"

# Get your backend URL
railway domain
```

#### Option B: Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `goagenticos-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `cargo build --release`
   - **Start Command**: `./target/release/goagenticos-backend`
5. Add Environment Variables:
   ```
   JWT_SECRET=your-secret-min-32-chars
   ANTHROPIC_API_KEY=sk-ant-...
   RUST_LOG=info
   PORT=3001
   ```

#### Option C: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
cd backend
fly launch --name goagenticos-backend

# Set secrets
fly secrets set JWT_SECRET="$(openssl rand -hex 32)"
fly secrets set ANTHROPIC_API_KEY="your-anthropic-key-here"
```

### 2. Set Up Database

#### Option A: Vercel Postgres

1. Go to [vercel.com](https://vercel.com)
2. Create a new project or select existing
3. Go to **Storage** → **Create Database** → **Postgres**
4. Copy the connection string from `.env.local` tab
5. Add `DATABASE_URL` to your backend service:
   ```bash
   # Railway
   railway variables set DATABASE_URL="your-postgres-url"

   # Render
   # Add in dashboard: Environment Variables

   # Fly.io
   fly secrets set DATABASE_URL="your-postgres-url"
   ```

#### Option B: Neon

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to your backend service (same as above)

### 3. Run Database Migrations

```bash
# Install sqlx-cli
cargo install sqlx-cli --no-default-features --features postgres

# Set database URL
export DATABASE_URL="your-postgres-url"

# Run migrations
cd backend
sqlx migrate run
```

### 4. Deploy Frontend to Vercel

#### Via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Next.js
5. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: Leave as auto-detected
   - **Output Directory**: Leave as auto-detected

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### 5. Configure Frontend Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.railway.app/api/v1
   NEXT_PUBLIC_LOG_LEVEL = info
   ```
3. Click **Save**
4. Redeploy: **Deployments** → Click "..." on latest → **Redeploy**

### 6. Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Sign up for an account
3. Create a project
4. Test creating requirements, domains, and data bags
5. Generate a specification with Claude

---

## Environment Variables Reference

### Backend (Railway/Render/Fly.io)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgres://user:pass@host/db` |
| `JWT_SECRET` | Yes | Secret for JWT tokens (min 32 chars) | Generate: `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | Yes | Claude API key | `sk-ant-api03-...` |
| `RUST_LOG` | No | Logging level | `info` or `debug` |
| `PORT` | No | Port to listen on | `3001` (default) |

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://backend.railway.app/api/v1` |
| `NEXT_PUBLIC_LOG_LEVEL` | No | Frontend logging level | `info` |

---

## Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Database created and migrations run
- [ ] Environment variables set on backend
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on frontend
- [ ] Test signup/login flow
- [ ] Test creating projects and requirements
- [ ] Test Claude API integration
- [ ] Set up custom domain (optional)
- [ ] Configure error monitoring (optional)

---

## Troubleshooting

### Backend Not Responding

```bash
# Check backend logs
# Railway
railway logs

# Render
# View in dashboard

# Fly.io
fly logs
```

### Database Connection Failed

1. Verify `DATABASE_URL` is correct
2. Check database is active and accessible
3. Ensure migrations ran successfully:
   ```bash
   cd backend
   DATABASE_URL="your-url" sqlx migrate run
   ```

### Frontend Can't Connect to Backend

1. Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Test backend directly:
   ```bash
   curl https://your-backend.railway.app/api/v1/health
   ```
3. Check CORS settings in backend
4. Verify backend is deployed and running

### CORS Errors

Make sure your backend CORS configuration allows requests from your Vercel domain.

In `backend/src/main.rs`, check the CORS configuration:
```rust
let cors = CorsLayer::new()
    .allow_origin(Any)  // Or specify your Vercel domain
    .allow_methods(Any)
    .allow_headers(Any);
```

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Verify `package.json` and `next.config.js` are correct
3. Ensure all dependencies are in `dependencies` (not `devDependencies`)
4. Test build locally:
   ```bash
   cd frontend
   npm run build
   ```

---

## Optional: Custom Domain

### Add Custom Domain to Vercel

1. Go to **Settings** → **Domains**
2. Add your domain
3. Configure DNS records as instructed

### Add Custom Domain to Backend

#### Railway
```bash
railway domain add yourdomain.com
```

#### Render
1. Go to your service → **Settings** → **Custom Domain**
2. Follow the instructions

---

## Optional: Monitoring & Analytics

### Error Tracking with Sentry

1. Create account at [sentry.io](https://sentry.io)
2. Create project for Next.js
3. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN = your-sentry-dsn
   ```
4. Install Sentry SDK:
   ```bash
   cd frontend
   npm install @sentry/nextjs
   ```

### Analytics

Vercel provides built-in analytics:
1. Go to **Analytics** tab in Vercel dashboard
2. View page views, performance metrics, etc.

---

## CI/CD Setup (Optional)

Vercel automatically deploys on git push. To customize:

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Cost Estimates

### Free Tier (Hobby Projects)

- **Vercel**: Free (includes hobby plan)
- **Railway**: $5/month free credit (then pay-as-you-go)
- **Vercel Postgres**: Free tier available
- **Neon**: Free tier available

### Production (Low Traffic)

- **Vercel Pro**: $20/month
- **Railway**: ~$10-20/month
- **Database**: ~$10-20/month

---

## Next Steps

1. ✅ Set up custom domain
2. ✅ Configure error monitoring
3. ✅ Set up analytics
4. ✅ Add more test data
5. ✅ Invite team members
6. ✅ Set up staging environment
7. ✅ Configure CI/CD pipeline

---

## Support

- **Issues**: Create an issue on GitHub
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Render Docs**: [render.com/docs](https://render.com/docs)

---

**Your app is now live! 🎉**

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
