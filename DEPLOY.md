# Quick Deploy Commands

## Deploy to Vercel

### 1. Deploy Backend to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
cd backend
railway login
railway init
railway up

# Set environment variables
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set ANTHROPIC_API_KEY="your-key-here"
railway variables set DATABASE_URL="your-postgres-url"

# Get backend URL
railway domain
```

### 2. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.railway.app/api/v1

# Redeploy with new env var
vercel --prod
```

### 3. Set Up Database

```bash
# Install sqlx-cli
cargo install sqlx-cli --no-default-features --features postgres

# Run migrations (use your DATABASE_URL)
cd backend
DATABASE_URL="your-postgres-url" sqlx migrate run
```

---

## Quick Vercel Dashboard Setup

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Import Git repository
3. **Root Directory**: Leave empty (Vercel will detect `frontend/`)
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.railway.app/api/v1`
5. Deploy

---

## Environment Variables Needed

### Backend
```bash
DATABASE_URL=postgres://...
JWT_SECRET=your-secret-32-chars-min
ANTHROPIC_API_KEY=sk-ant-...
RUST_LOG=info
```

### Frontend
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_LOG_LEVEL=info
```

---

## Troubleshooting

### Check Backend Health
```bash
curl https://your-backend.railway.app/api/v1/health
```

### View Backend Logs
```bash
railway logs
```

### View Frontend Logs
Go to Vercel Dashboard → Your Project → Deployments → View Logs

---

For detailed deployment guide, see [VERCEL-DEPLOYMENT-GUIDE.md](./VERCEL-DEPLOYMENT-GUIDE.md)
