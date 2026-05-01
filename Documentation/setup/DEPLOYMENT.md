# Deployment Guide

Deploy Invento to production.

## Prerequisites

- Vercel account (for frontend)
- Convex production deployment
- All environment variables configured

## Frontend Deployment (Vercel)

### Step 1: Configure Environment
Add to Vercel project settings:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CONVEX_URL
CONVEX_DEPLOYMENT
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_SECRET_KEY
```

### Step 2: Deploy
```bash
git push origin main
```

Vercel automatically deploys on push to main.

### Step 3: Verify
- Check build logs
- Test deployed URL
- Verify all features work

## Backend Deployment (Convex)

### Step 1: Push to Convex
```bash
npx convex push
```

### Step 2: Monitor
Check Convex dashboard for:
- Queries/mutations working
- No errors in logs
- Database synced

## Rollback Plan

If deployment breaks:

```bash
# Revert last commit
git revert HEAD
git push origin main

# Check Convex status
npx convex status
```

## Post-Deployment

- [ ] Monitor error logs
- [ ] Test all features
- [ ] Verify payments working
- [ ] Check analytics

---

**See Also**: setup/ENV_VARS.md for configuration reference
