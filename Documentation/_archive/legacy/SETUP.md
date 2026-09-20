# Setup Guide

Complete environment setup for Invento development.

## Prerequisites

- Node.js 18+
- npm or pnpm
- Git
- Clerk account
- Convex account

## Step 1: Clone & Install

```bash
git clone https://github.com/sonigaurav1/invento.git
cd invento
pnpm install  # or npm install
```

## Step 2: Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

Required variables:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CONVEX_URL
- CONVEX_DEPLOYMENT

See: setup/ENV_VARS.md for complete list

## Step 3: Start Servers

**Terminal 1: Convex Backend**
```bash
pnpm convex dev
```

**Terminal 2: Next.js Frontend**
```bash
pnpm dev
```

Opens http://localhost:3000

## Step 4: Create Test Account

1. Go to http://localhost:3000
2. Sign up with email
3. Complete company setup
4. You have an organization with sample data

## Verify Setup

- Frontend loads without errors
- Can sign in
- Dashboard shows data
- No console errors

## Common Issues

- **"Cannot find module 'convex/react'"**
  → Run `pnpm convex` in another terminal

- **"No organization after sign-up"**
  → Check Clerk configuration in .env.local

- **"Port 3000 already in use"**
  → Kill process: `kill -9 $(lsof -ti:3000)`
  → Or use different port: `pnpm dev -- -p 3001`

## Next Steps

1. Read: QUICK_START.md
2. Read: ARCHITECTURE.md
3. Read: setup/ONBOARDING.md

---

**See Also**: setup/ONBOARDING.md for detailed development setup
