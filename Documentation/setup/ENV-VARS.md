# Environment Variables

Complete reference for all environment variables needed in Invento.

## File Structure

- `.env.example` - Template with all required variables
- `.env.local` - Local development (git-ignored)
- `.env.production` - Production deployment

## Required Variables

### Clerk Authentication
```env
# Public key (available in browser)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Secret key (server-only, must not expose)
CLERK_SECRET_KEY=sk_test_...

# API endpoints
CLERK_API_URL=https://api.clerk.com
```

Where to find:
- Log in to [Clerk Dashboard](https://dashboard.clerk.com)
- Go to API Keys section
- Copy both keys

### Convex Backend
```env
# Deployment URL (unique to your Convex project)
NEXT_PUBLIC_CONVEX_URL=https://YOUR-PROJECT.convex.cloud

# Deployment ID (for Convex CLI commands)
CONVEX_DEPLOYMENT=prod:YOUR-DEPLOYMENT-ID
```

Where to find:
- Run `pnpm convex` - prints deployment URL
- Or visit [Convex Dashboard](https://dashboard.convex.dev)

### Razorpay Payments
```env
# Public key for payment form
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# Secret key (server-only)
RAZORPAY_SECRET_KEY=...
```

Where to find:
- Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
- Go to Settings → API Keys

## Optional Variables

### Email Services

#### SendGrid (Email Notifications)
```env
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### Slack Integration
```env
# For Slack notifications
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C...
```

#### Twilio (SMS)
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### EdgeStore (File Storage)
```env
# API keys for file uploads
NEXT_PUBLIC_EDGESTORE_PUBLIC_TOKEN=ebpub_...
EDGESTORE_SECRET_TOKEN=ebsk_...
```

### Analytics
```env
# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...

# Vercel Speed Insights
NEXT_PUBLIC_SPEED_INSIGHTS_ENABLED=true
```

### Development
```env
# Enable experimental HTTPS
NEXT_PUBLIC_EXPERIMENTAL_HTTPS=true

# Log level
LOG_LEVEL=debug
```

## Loading Environment Variables

### Next.js Automatic Loading
Files are loaded in this order:

1. `.env.local` (development)
2. `.env.{NODE_ENV}` (production/test)
3. `.env` (fallback)

Next.js automatically loads these - no special code needed.

### Accessing in Code

```typescript
// On client side (must have NEXT_PUBLIC_ prefix)
const apiKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

// On server side (any prefix)
const secretKey = process.env.RAZORPAY_SECRET_KEY;

// In API routes
export async function GET(req: Request) {
  const secret = process.env.CLERK_SECRET_KEY; // ✓ OK
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID; // ✓ OK too
}
```

### Never do this:
```typescript
// ✗ DON'T - Exposes secret in browser
process.env.CLERK_SECRET_KEY  // In client component

// ✗ DON'T - Wait for runtime
const apiUrl = `https://${process.env.NEXT_PUBLIC_CONVEX_URL}`;
// Use: const apiUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
```

## Setup Instructions

### First Time Setup

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Fill in Clerk keys
# Edit .env.local and add:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# CLERK_SECRET_KEY=...

# 3. Add Convex URL
# From `pnpm convex` output:
# NEXT_PUBLIC_CONVEX_URL=https://...

# 4. (Optional) Add Razorpay keys
# NEXT_PUBLIC_RAZORPAY_KEY_ID=...
# RAZORPAY_SECRET_KEY=...

# 5. Start dev servers
pnpm convex   # Terminal 1
pnpm dev      # Terminal 2
```

### Production Deployment

```bash
# 1. Set environment in deployment platform
# For Vercel: Settings → Environment Variables

# 2. Add all required variables:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CONVEX_URL
CONVEX_DEPLOYMENT
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_SECRET_KEY

# 3. Set NODE_ENV=production

# 4. Deploy and test
vercel deploy --prod
```

## Validation Checklist

- [ ] `.env.local` exists and is git-ignored
- [ ] All `NEXT_PUBLIC_` variables are set
- [ ] All `CLERK_*` variables are set
- [ ] `NEXT_PUBLIC_CONVEX_URL` matches Convex project
- [ ] `CONVEX_DEPLOYMENT` set correctly
- [ ] No secrets committed to git
- [ ] Dev server starts without errors
- [ ] Sign-up works without errors

## Debugging Environment Issues

### "Cannot find CONVEX_URL"
Check that `NEXT_PUBLIC_CONVEX_URL` is set:
```bash
grep CONVEX_URL .env.local
```

### "Clerk sign-in not working"
Verify Clerk keys:
```bash
grep CLERK .env.local
# Should show both PUBLISHABLE_KEY and SECRET_KEY
```

### "Payment button doesn't work"
Check Razorpay key:
```bash
grep RAZORPAY .env.local
# Should show NEXT_PUBLIC_RAZORPAY_KEY_ID
```

### "Changes to .env.local not reflected"
Next.js caches env vars. Restart dev server:
```bash
# Stop dev server (Ctrl+C)
pnpm dev
# Restart will pick up new env vars
```

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate keys periodically** - Especially secrets
3. **Use different keys per environment** - Dev/test/prod
4. **Store secrets in secure vaults** - Not in .env for production
5. **Limit key permissions** - Only needed scopes
6. **Monitor key usage** - Check dashboards for suspicious activity

## Related Documentation

- [ONBOARDING.md](ONBOARDING.md) - Setup instructions
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment process
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Common issues
