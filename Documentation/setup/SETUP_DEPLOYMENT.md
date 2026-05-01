# Setup & Deployment Guide

**For Business Owners & IT Teams**

Complete guide to set up, deploy, and configure the enterprise inventory management system.

---

## Pre-Deployment Checklist

### System Requirements

**Server Requirements**

- [ ] Node.js 18+ installed
- [ ] npm/pnpm package manager
- [ ] Git for version control
- [ ] Docker (optional, for containerization)

**External Services (Create Accounts)**

- [ ] Convex account (https://convex.dev)
- [ ] Clerk account (https://clerk.com)
- [ ] Razorpay account (https://razorpay.com)
- [ ] SendGrid account (https://sendgrid.com)
- [ ] Vercel account (https://vercel.com)

**Domain & SSL**

- [ ] Custom domain registered
- [ ] SSL certificate ready
- [ ] DNS records configured

---

## Phase 1: Development Setup (30 minutes)

### Step 1: Clone Repository

```bash
cd /path/to/your/projects
git clone https://github.com/your-repo/inventory-system.git
cd inventory-system
```

### Step 2: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Step 3: Set Up Convex

```bash
# Install Convex CLI
pnpm add -g convex

# Initialize Convex (if not already done)
convex init

# This will:
# - Create .env.local file
# - Link to your Convex project
# - Set up database schema
```

### Step 4: Configure Environment Variables

Create `.env.local` file:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# External Services
SENDGRID_API_KEY=SG.xxxxx
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=...

# Optional: Integrations
SHOPIFY_API_KEY=...
TALLY_API_KEY=...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Set Up Database Schema

```bash
# Apply schema to Convex database
convex push

# This deploys all files in convex/ folder
```

### Step 6: Seed Sample Data (Optional)

```bash
# Run seeding script
node scripts/seed.js

# Or via Convex dashboard:
# - Go to Convex dashboard
# - Run the seed function
```

### Step 7: Start Development Server

```bash
# Start Next.js dev server
pnpm dev

# Server runs at http://localhost:3000
```

### Step 8: Login & Create Account

1. Open http://localhost:3000 in browser
2. Click "Sign Up"
3. Create account with Clerk
4. Complete setup wizard
5. Add sample products/suppliers

---

## Phase 2: Production Deployment (1-2 hours)

### Option A: Deploy to Vercel (Recommended)

#### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

#### Step 2: Create Vercel Project

1. Go to https://vercel.com/new
2. Import the GitHub repository
3. Select project root folder
4. Configure environment variables:
   - Add all keys from `.env.local`
   - Use Production values (not test keys)

#### Step 3: Deploy

```bash
# Vercel automatically deploys on push to main
# OR manually deploy:
vercel --prod

# Deployment takes ~5 minutes
```

#### Step 4: Configure Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel provides instructions)
4. Wait for DNS propagation (up to 48 hours)

#### Step 5: Set Up Auto-Deployments

1. Vercel Dashboard → Settings → Git
2. Enable: Auto-deploy on push to main
3. Enable: Preview deployments for PRs

---

### Option B: Deploy to AWS/GCP/Azure

#### Prerequisites

- AWS/GCP/Azure account
- Docker installed locally
- Container registry access

#### Step 1: Containerize Application

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build Next.js
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

#### Step 2: Build & Push Docker Image

```bash
# Build image
docker build -t inventory-system:latest .

# Tag for registry
docker tag inventory-system:latest YOUR_REGISTRY/inventory-system:latest

# Push to registry
docker push YOUR_REGISTRY/inventory-system:latest
```

#### Step 3: Deploy to Container Service

**AWS ECS:**

```bash
# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service --cluster production \
  --service-name inventory-system \
  --task-definition inventory-system:1 \
  --desired-count 2
```

**Google Cloud Run:**

```bash
# Deploy service
gcloud run deploy inventory-system \
  --image YOUR_REGISTRY/inventory-system:latest \
  --platform managed \
  --region us-central1 \
  --memory 2Gi
```

#### Step 4: Set Up Environment Variables

In your container orchestration platform:

1. Create secrets for sensitive values
2. Set environment variables from secrets
3. Configure health checks
4. Set up auto-scaling policies

---

## Phase 3: Production Configuration

### Database Configuration

#### In Convex Dashboard:

1. **Create Production Database**

   - Convex Dashboard → Settings
   - Choose region (typically closest to users)
   - Enable backups

2. **Configure Indexes**

   ```bash
   convex run schema:createIndexes
   ```

3. **Set Database Backups**
   - Frequency: Daily
   - Retention: 30 days
   - Recovery Point Objective (RPO): 5 minutes

### Authentication Setup

#### Clerk Configuration:

1. Go to Clerk Dashboard
2. Navigate to Development → Production
3. Create Production API Keys
4. Set Allowed Origins:

   - Your production domain
   - Your staging domain (for testing)

5. Configure Sign-Up/Sign-In:
   - Email + Password
   - Social login (Google, Microsoft)
   - Two-factor authentication (optional)

### Email Service Configuration

#### SendGrid Setup:

1. Create SendGrid account
2. Verify sender domain
3. Create API key
4. Add transaction email templates:
   - Welcome email
   - Password reset
   - Invoice copy
   - Low stock alert
   - Payment confirmation

### Payment Gateway Configuration

#### Razorpay Setup:

1. Verify business details in Razorpay
2. Get Production API keys
3. Configure webhook endpoint:
   ```
   https://yourdomain.com/api/webhooks/razorpay
   ```
4. Test payment flow end-to-end

---

## Phase 4: Security Hardening

### SSL/TLS Certificate

```bash
# If using Let's Encrypt (typically auto-configured)
# Vercel: Auto-configured with free SSL
# AWS: Use AWS Certificate Manager
# GCP: Built-in with Google-managed certificates

# Test SSL
curl -I https://yourdomain.com
```

### Configure CORS

In `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://yourdomain.com'
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' }
        ]
      }
    ];
  }
};
```

### Set Security Headers

In `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
      ]
    }
  ]
}
```

### Database Encryption

```bash
# Enable encryption at rest in Convex
convex env set ENCRYPTION_KEY=$(openssl rand -hex 32)
```

### API Rate Limiting

In Convex functions:

```typescript
// Implement rate limiting
const limiter = new RateLimiter();

export const createSale = mutation(async (ctx, args) => {
  const userId = ctx.auth.getUserIdentity()?.sub;

  if (!limiter.allowRequest(userId)) {
    throw new Error('Rate limit exceeded');
  }

  // ... create sale
});
```

---

## Phase 5: Monitoring & Logging

### Set Up Error Tracking

#### Sentry Configuration:

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Initialize in next.config.js
withSentryConfig(nextConfig, {
  org: 'your-org',
  project: 'inventory-system'
})
```

Create `.env.production` with Sentry DSN:

```env
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### Set Up Performance Monitoring

```bash
# Install monitoring tools
pnpm add datadog-browser-rum datadog-browser-logs

# Initialize in _app.tsx
datadogRum.init({
  applicationId: 'YOUR_APP_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  site: 'datadoghq.com',
  service: 'inventory-system',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20
});
```

### Set Up Log Aggregation

Configure CloudWatch/Stackdriver/Datadog:

```typescript
// In Convex functions
export const createSale = mutation(async (ctx, args) => {
  ctx.scheduler.runAfter(1000, 'log:sale_created', {
    saleId: sale.id,
    amount: sale.total,
    timestamp: new Date()
  });
});
```

### Create Monitoring Dashboard

- **Key Metrics to Monitor**:
  - Error rate (target: <0.1%)
  - Response time P95 (target: <500ms)
  - Database latency (target: <50ms)
  - API quota usage
  - Disk space usage
  - Memory usage

---

## Phase 6: Backup & Disaster Recovery

### Configure Automated Backups

#### In Convex Dashboard:

1. Settings → Backups
2. Enable automated daily backups
3. Set retention to 30 days
4. Test restore procedure

#### Create Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# Export database
convex export $BACKUP_DIR/export_$BACKUP_DATE.json

# Backup .env.production file (separately, encrypted)
gpg -c .env.production -o $BACKUP_DIR/.env.production.$BACKUP_DATE.gpg

# Upload to S3
aws s3 cp $BACKUP_DIR s3://your-backups-bucket/ --recursive

echo "Backup completed: $BACKUP_DATE"
```

Schedule with cron:

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Disaster Recovery Procedure

In case of data loss:

1. **Assess Impact**

   ```bash
   # Check Convex backup status
   convex list-backups
   ```

2. **Restore from Backup**

   ```bash
   # Import backup
   convex import ./backups/export_YYYYMMDD.json
   ```

3. **Verify Data**

   - Check key metrics
   - Test critical flows
   - Verify audit log

4. **Communicate Incident**
   - Notify users
   - Post status update
   - Follow post-mortem procedure

---

## Phase 7: Testing Deployment

### Pre-Production Testing Checklist

- [ ] All forms submit successfully
- [ ] Reports generate without errors
- [ ] Forecasts calculate accurately
- [ ] Email notifications send
- [ ] PDF invoices generate
- [ ] Dashboard updates in real-time
- [ ] Search/filters work correctly
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable (<2s load time)
- [ ] No console errors

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create load test
artillery quick --count 100 --num 50 https://yourdomain.com
```

### Security Testing

```bash
# Run OWASP security scan
npm install -g owasp-dependency-check
dependency-check --project inventory-system --scan ./

# SSL test
curl https://www.ssllabs.com/api/v3/analyze?host=yourdomain.com
```

---

## Phase 8: Post-Deployment

### Day 1 Monitoring

- Check for errors in real-time
- Monitor database performance
- Verify backups completed
- Test key user flows
- Check email delivery

### Week 1 Monitoring

- Review performance metrics
- Check storage usage
- Verify all integrations working
- Test failure scenarios
- Review error logs for patterns

### Ongoing Maintenance

- **Weekly**: Check system health, review error logs
- **Monthly**: Review performance metrics, optimize slow queries
- **Quarterly**: Security audit, backup restoration test
- **Annually**: Disaster recovery drill, compliance audit

---

## Troubleshooting Common Issues

### Database Connection Issues

```bash
# Check Convex connection
curl https://your-project.convex.cloud/

# Verify environment variables
echo $NEXT_PUBLIC_CONVEX_URL

# Reconnect to Convex
convex auth
```

### Deployment Failures

```bash
# Check build logs
vercel logs --tail

# Rebuild locally
npm run build

# Check for type errors
npm run type-check
```

### Performance Issues

```bash
# Profile database queries
convex profile

# Check Vercel analytics
vercel analytics

# Identify slow endpoints
grep "response_time" logs/* | sort -t: -k2 -rn | head
```

### Email Not Sending

1. Verify SendGrid API key in Convex
2. Check sender email verified in SendGrid
3. Review SendGrid bounce/spam logs
4. Test email in development first

### Payment Processing Issues

1. Verify Razorpay API keys
2. Check webhook endpoint receiving events
3. Review Razorpay logs for errors
4. Test with test credentials first

---

## Environment Checklists

### Development Environment

- [ ] Node.js installed
- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env.local` configured with test keys
- [ ] Convex CLI installed
- [ ] Local server runs without errors

### Staging Environment

- [ ] Deployed to Vercel preview
- [ ] All test credentials configured
- [ ] Database separated from production
- [ ] Email sending to test email
- [ ] Performance acceptable

### Production Environment

- [ ] All production API keys configured
- [ ] Database backups enabled
- [ ] SSL certificate configured
- [ ] Error tracking enabled (Sentry)
- [ ] Performance monitoring enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Monitoring dashboard live

---

## Support & Escalation

### Issues Contact

- **Technical Issues**: tech-support@company.com
- **Security Issues**: security@company.com
- **Business Issues**: hello@company.com

### Emergency Hotline

- **24/7 Support**: +1-XXX-XXX-XXXX
- **On-Call Engineer**: Available for production outages

### Documentation & Resources

- Technical Documentation: `/Documentation/ENTERPRISE_ARCHITECTURE.md`
- User Guide: `/Documentation/ENTERPRISE_GUIDE.md`
- API Reference: `/Documentation/API_REFERENCE.md`
- Video Tutorials: In-app, accessible to all users

---

## Quick Reference Commands

```bash
# Development
pnpm dev              # Start dev server
npm run build         # Build for production
npm run lint          # Check code quality
npm run type-check    # Check TypeScript

# Convex
convex dev            # Start Convex dev environment
convex push           # Deploy schema changes
convex tunnel         # Local tunnel for webhooks
convex export         # Export database

# Deployment
vercel --prod         # Deploy to production
vercel logs --tail    # Stream logs
vercel env list       # List environment variables

# Testing
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:load     # Run load test

# Database
convex import         # Import data
convex backup         # Trigger backup
convex restore        # Restore from backup
```

---

## Next Steps

1. ✅ Complete Phase 1-8 above
2. ✅ Create admin user account
3. ✅ Add your first product
4. ✅ Test complete workflow
5. ✅ Invite team members
6. ✅ Conduct training session
7. ✅ Monitor for first week
8. ✅ Scale to more users as needed

**Congratulations! Your enterprise system is live.** 🚀
