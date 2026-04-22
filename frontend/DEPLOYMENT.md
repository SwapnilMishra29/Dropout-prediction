# Dropout Prediction Frontend - Vercel Deployment Guide

## Quick Start

### Step 1: Prepare Your Repository
```bash
# Make sure you're in the frontend directory
cd frontend

# Commit all changes
git add .
git commit -m "Add Vercel deployment configuration"

# Push to GitHub/GitLab
git push origin main
```

### Step 2: Deploy on Vercel

#### Option A: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Import your GitHub/GitLab repository
3. Select the `frontend` folder as the root directory
4. Add Environment Variables (see Step 3)
5. Click Deploy

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Step 3: Set Environment Variables on Vercel

**Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:
```
NEXT_PUBLIC_API_URL = https://your-backend-url.com/api
```

**IMPORTANT:**
- Replace `https://your-backend-url.com/api` with your actual backend URL
- Currently set to: `https://dropout-prediction-kl17.onrender.com/api`
- Make sure your backend is deployed and running before deploying frontend

### Step 4: Verify Deployment

After deployment:
1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Check if the dashboard loads
3. Open browser DevTools (F12 → Network tab)
4. Verify API calls are going to your backend URL (not localhost)

## Configuration Files

### vercel.json
Specifies build configuration for Vercel:
- `buildCommand`: How to build your app
- `env`: Required environment variables
- `regions`: Deployment regions

### .env.production
Environment variables for production build:
- `NEXT_PUBLIC_API_URL`: Your deployed backend URL

### .env.local
Environment variables for local development:
- `NEXT_PUBLIC_API_URL`: localhost API URL

## Troubleshooting

### Issue 1: "API is not accessible" error on Vercel
**Solution:**
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel Environment Variables
- Verify your backend is deployed and running
- Check CORS settings on your backend

### Issue 2: App loads but shows blank page
**Solution:**
- Check browser console (F12) for errors
- Check Vercel build logs for compilation errors
- Verify all dependencies are installed

### Issue 3: "Build failed" error
**Solution:**
```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run lint

# Clear cache and rebuild
rm -rf .next
npm run build
```

### Issue 4: Environment variables not working
**Solution:**
- Prefix must be `NEXT_PUBLIC_` for client-side variables
- Redeploy after adding/changing env vars
- Check Vercel build logs to confirm env var was loaded

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | Yes | `https://api.dropout.com/api` | Backend API URL - must be public (client-side) |

## Local Development

### Running Locally
```bash
cd frontend
npm install
npm run dev

# Visit http://localhost:3000
```

### Using .env.local
```bash
# Copy .env.local
cp .env.local .env.local

# Edit with your local API URL
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Deployment Checklist

- [ ] Backend is deployed and running
- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel Environment Variables
- [ ] `vercel.json` exists in frontend directory
- [ ] `.env.production` has correct backend URL
- [ ] No console errors when running `npm run build`
- [ ] Local dev server works with `npm run dev`
- [ ] Git repository is connected to Vercel
- [ ] All dependencies are up-to-date

## Pages & Routes

Your frontend has these pages:

| Route | Purpose |
|-------|---------|
| `/` | Dashboard - Overview & statistics |
| `/students` | Student list with risk levels |
| `/students/[id]` | Individual student details |
| `/students/new` | Create new student |
| `/alerts` | View system alerts |
| `/analytics` | Analytics dashboard |
| `/bulk-upload` | Upload CSV files |
| `/settings` | App settings |

## API Integration

Your frontend connects to these API endpoints:
- `/students` - Student management
- `/academic` - Academic records
- `/finance` - Finance records
- `/predictions` - Risk predictions
- `/alerts` - Alert management
- `/upload` - File uploads

All requests are made via `/lib/api-client.ts` with proper error handling.

## Performance Tips

1. **Enable Vercel Analytics**
   - In Vercel Dashboard → Settings → Analytics

2. **Use Vercel Edge Functions** (Optional)
   - For faster API responses

3. **Monitor Build Time**
   - Keep it under 60 seconds

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Issues? Check Vercel build logs in Dashboard

---

**Last Updated:** April 22, 2026
**Frontend Version:** Next.js 16.2.0 with React 19
