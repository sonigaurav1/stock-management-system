# Environment Variables Reference

Environment variable configuration for local development and production deployment.

---

## 🔑 Environment Variables Specification

Copy `.env.example` to `.env.local`:

```bash
# Convex Deployment Credentials
NEXT_PUBLIC_CONVEX_URL="https://your-convex-deployment.convex.cloud"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# EdgeStore File Storage Credentials
EDGE_STORE_ACCESS_KEY="access_key_..."
EDGE_STORE_SECRET_KEY="secret_key_..."

# SendGrid Email Credentials
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
SENDGRID_FROM_EMAIL="noreply@invento.app"
```

---

## 🚫 Removed / Deprecated Keys
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (Payment gateway removed).
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` (SMS integration removed).
- `SLACK_WEBHOOK_URL` (Slack notification integration removed).

---

## 🔗 Related Links
- **Quick Start Guide**: [QUICK_START.md](file:///Users/gaurav/Desktop/Invento/Documentation/setup/QUICK_START.md)
- **Master Sitemap**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
