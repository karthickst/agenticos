# 🚀 Quick Vercel Deployment

This guide will get you deployed to Vercel in minutes.

## One-Click Setup

### Step 1: Deploy Frontend to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/goagenticos&project-name=goagenticos&repository-name=goagenticos&root-directory=frontend)

### Step 2: Create Vercel Postgres Database

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Click **Continue**
5. Name your database (e.g., "goagenticos-db")
6. Select region closest to you
7. Click **Create**

### Step 3: Get Database Connection String

1. Click on your newly created database
2. Go to **.env.local** tab
3. Copy the `POSTGRES_URL` value
4. Save it for later

### Step 4: Run Database Migrations

```bash
# Install sqlx-cli
cargo install sqlx-cli --no-default-features --features postgres

# Set your database URL
export DATABASE_URL="your-postgres-url-from-step-3"

# Run migrations
cd backend
sqlx migrate run
```

### Step 5: Deploy Backend to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Go to backend directory
cd backend

# Initialize and deploy
railway init
railway variables set DATABASE_URL="your-postgres-url"
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set ANTHROPIC_API_KEY="your-anthropic-key"
railway up

# Get your backend URL
railway domain
```

### Step 6: Update Frontend Environment Variables

1. Go back to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
NEXT_PUBLIC_API_URL=https://your-app.railway.app/api/v1
NEXT_PUBLIC_LOG_LEVEL=info
RUST_API_URL=https://your-app.railway.app
```

5. Click **Save**
6. Go to **Deployments** and click **Redeploy**

### Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Sign up for an account
3. Create a project
4. Test creating a requirement
5. Test generating a specification with Claude

## 🎉 Done!

Your application is now live on:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`

## Environment Variables Reference

### Required for Backend (Railway/Render)

```bash
DATABASE_URL=postgres://...               # From Vercel Postgres
JWT_SECRET=your-secret-min-32-chars       # Generate with: openssl rand -hex 32
ANTHROPIC_API_KEY=sk-ant-...              # From console.anthropic.com
RUST_LOG=info                             # Optional
PORT=3001                                 # Optional
```

### Required for Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://backend.railway.app/api/v1
NEXT_PUBLIC_LOG_LEVEL=info               # Optional
RUST_API_URL=https://backend.railway.app  # Optional
```

## Troubleshooting

### Backend not responding
```bash
railway logs
```

### Frontend can't connect to backend
1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify backend is running: `curl https://your-backend.railway.app/api/v1/health`
3. Check CORS settings

### Database connection issues
1. Verify `DATABASE_URL` is correct
2. Check Vercel Postgres is active
3. Ensure migrations ran successfully

## Next Steps

- [ ] Set up custom domain
- [ ] Configure error monitoring (Sentry)
- [ ] Set up CI/CD with GitHub Actions
- [ ] Add more test data
- [ ] Invite team members

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Need help?** Create an issue on GitHub
