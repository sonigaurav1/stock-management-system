# Setup & Configuration

**Environment configuration, deployment, and setup guides**

Everything you need to set up your development environment, configure the application, and deploy to production.

---

## 
### Quick Setup
- **[ONBOARDING.md](ONBOARDING.md)** - Development environment setup for new developers
  - Prerequisites
  - Installation steps
  - Verification checklist
  - Troubleshooting

### Configuration
- **[ENV-VARS.md](ENV-VARS.md)** - Complete environment variables reference
  - All required variables
  - Optional variables
  - Description and usage
  - Example .env file

### Deployment
- **[SETUP_DEPLOYMENT.md](SETUP_DEPLOYMENT.md)** - Deployment checklist and guide
  - Pre-deployment checklist
  - Deployment steps
  - Post-deployment verification
  - Rollback procedures

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
  - Production environment setup
  - CI/CD pipeline
  - Database migrations
  - Monitoring and alerts

---

## 
```bash
# 1. Clone repository
git clone https://github.com/sonigaurav1/stock-management-system.git
cd Invento

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env.local

# 4. Start development servers
# Terminal 1:
pnpm run dev

# Terminal 2:
pnpm run convex

# 5. Verify
# Open http://localhost:3000
```

Full details: [ONBOARDING.md](ONBOARDING.md)

---

## 
Key variables you'll need:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=...
```

See [ENV-VARS.md](ENV-VARS.md) for complete reference.

---

## 
- [ ] Node.js 18+ installed
- [ ] pnpm installed globally
- [ ] Git repository cloned
- [ ] Dependencies installed
- [ ] .env.local file created
- [ ] Environment variables configured
- [ ] Dev servers started
- [ ] Application accessible at http://localhost:3000

---

## 
```
setup/
 README. YOU ARE HEREmd                  
 Dev setup guide
 Environment variables reference
 Deployment checklist
 Production deployment
```

---

## 
| Need | Go To |
|------|-------|
| Getting started | [../getting-started/](../getting-started/) |
| Environment setup | [ENV-VARS.md](ENV-VARS.md) |
| Production deployment | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Troubleshooting | [../tools/TROUBLESHOOTING.md](../tools/TROUBLESHOOTING.md) |

---

**Last Updated**: 2026-05-10  
**Maintained By**: DevOps Team  
**Related**: [/Documentation/INDEX.md](../INDEX.md)
