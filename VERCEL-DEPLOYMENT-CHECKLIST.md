# ✅ Vercel Deployment Checklist

## Pre-Deployment Verification

### Files Created ✅
- [x] `vercel.json` - Vercel configuration
- [x] `frontend/vercel.json` - Frontend-specific config
- [x] `backend/Dockerfile` - Backend containerization
- [x] `frontend/Dockerfile` - Frontend containerization
- [x] `docker-compose.yml` - Local development
- [x] `.github/workflows/deploy.yml` - CI/CD pipeline
- [x] `.env.example` - Environment template
- [x] `.env.production.example` - Production template
- [x] `DEPLOYMENT.md` - Complete deployment guide
- [x] `VERCEL-SETUP.md` - Quick setup guide
- [x] `scripts/setup-vercel-db.sh` - Database setup script

### Code Updates ✅
- [x] Frontend: Standalone output enabled
- [x] Frontend: Security headers configured
- [x] Frontend: Production optimizations
- [x] Backend: CORS configured
- [x] Backend: Logging enhanced
- [x] Backend: Health check endpoint
- [x] Both: Environment variable support

### Build Tests ✅
- [x] Backend builds successfully: `cargo build`
- [x] Frontend builds successfully: `npm run build`
- [x] Docker builds configured
- [x] Database migrations ready

## Deployment Steps

### Step 1: Create Vercel Postgres
```bash
vercel postgres create
```
Get your `DATABASE_URL` from Vercel Dashboard.

### Step 2: Run Database Migrations
```bash
export DATABASE_URL="your-postgres-url"
cd backend
sqlx migrate run
```

### Step 3: Deploy Backend to Railway
```bash
railway init
railway variables set DATABASE_URL="your-url"
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set ANTHROPIC_API_KEY="your-key"
railway up
```

### Step 4: Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

Then in Vercel Dashboard:
- Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1`

### Step 5: Test Deployment
1. Visit your Vercel URL
2. Sign up for an account
3. Create a project
4. Create a requirement
5. Generate a specification

## Environment Variables

### Backend (Set in Railway/Render)
```
DATABASE_URL=postgres://...
JWT_SECRET=<32+ character random string>
ANTHROPIC_API_KEY=sk-ant-...
RUST_LOG=info
PORT=3001
```

### Frontend (Set in Vercel)
```
NEXT_PUBLIC_API_URL=https://backend.railway.app/api/v1
NEXT_PUBLIC_LOG_LEVEL=info
```

## Monitoring

### Backend Logs (Railway)
```bash
railway logs
```

### Frontend Logs (Vercel)
Go to: Vercel Dashboard → Deployments → Function Logs

### Local Logs
```bash
tail -f backend/logs/goagenticos.log
tail -f frontend/logs/frontend.log
```

## Troubleshooting

### Backend Won't Start
- Check: `railway logs`
- Verify: DATABASE_URL is set
- Test: `curl https://your-backend.railway.app/api/v1/health`

### Frontend Can't Connect
- Verify: `NEXT_PUBLIC_API_URL` is correct
- Check: Backend is running
- Test: Backend health check passes

### Database Issues
- Verify: Connection string includes `?sslmode=require`
- Check: Migrations ran successfully
- Test: `psql "your-database-url"`

## Production Checklist

Before launching:
- [ ] All environment variables set
- [ ] Database migrations successful
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] User signup/login works
- [ ] Project creation works
- [ ] Requirement creation works
- [ ] Claude specification generation works
- [ ] Logs are being captured
- [ ] SSL certificates valid
- [ ] Custom domain configured (optional)

## Success Criteria

✅ Backend deployed and healthy
✅ Frontend deployed and accessible
✅ Database connected
✅ Full user flow works end-to-end
✅ Logs available for debugging

---

**Documentation**: See DEPLOYMENT.md for detailed guide
**Quick Start**: See VERCEL-SETUP.md for 10-minute deploy
**Support**: Create GitHub issue
