/\*\*

- Quick Setup Guide - Backend Integration
- 5-minute summary to get started
  \*/

# 🚀 Quick Setup Guide

## Step 1: Install Dependencies (2 min)

```bash
npm install @sendgrid/mail twilio @slack/bolt razorpay
```

## Step 2: Environment Variables (1 min)

Create `.env.local`:

```env
# Convex
CONVEX_DEPLOYMENT=your_deployment_id
NEXT_PUBLIC_CONVEX_URL=https://your_id.convex.cloud

# Email (SendGrid)
SENDGRID_API_KEY=SG.your_key
EMAIL_FROM=noreply@inventorysystem.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Chat (Slack)
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

# Payments (Razorpay)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Analytics
POSTHOG_API_KEY=phc_...

# App
APP_URL=http://localhost:3000
```

## Step 3: Update Convex Schema (1 min)

Copy content from `convex/schema.additions.ts` into `convex/schema.ts`:

```typescript
export default defineSchema({
  // ... existing tables ...

  // Add these:
  organizationSettings: defineTable({ ... }).index('by_user', ['userId']),
  notificationRules: defineTable({ ... }).index('by_user', ['userId']),
  integrations: defineTable({ ... }).index('by_user', ['userId']),
  // ... rest from schema.additions.ts
});
```

Run: `npx convex dev`

## Step 4: Deploy Convex API Functions (< 1 min)

Files in `convex/` directory are auto-deployed:

- ✅ settings.ts
- ✅ notifications.ts
- ✅ integrations.ts
- ✅ api.ts
- ✅ automation.ts
- ✅ auditLog.ts

## Start Using It

### In Your Settings Components:

```typescript
import { useOrganizationSettings } from '@/hooks/useSettings';

export function OrganizationSettings() {
  const { settings, updateSettings } = useOrganizationSettings();

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await updateSettings(formData);
    }}>
      {/* Your form fields */}
    </form>
  );
}
```

---

## What's Included

| Component             | Purpose               | Status   |
| --------------------- | --------------------- | -------- |
| **Convex Database**   | Store all settings    | ✅ Ready |
| **API Mutations**     | CRUD operations       | ✅ Ready |
| **React Hooks**       | Component integration | ✅ Ready |
| **Email Service**     | SendGrid integration  | ✅ Ready |
| **SMS Service**       | Twilio integration    | ✅ Ready |
| **Slack Integration** | Channel notifications | ✅ Ready |
| **Webhooks**          | Event delivery system | ✅ Ready |
| **Payments**          | Razorpay billing      | ✅ Ready |
| **Analytics**         | Usage tracking        | ✅ Ready |

---

## Test It

### 1. Save Organization Settings:

Go to Settings → Organization and fill out the form. Data saves to Convex.

### 2. Create Notification Rule:

Go to Settings → Notifications, create a rule. Check Convex dashboard.

### 3. Test Webhook:

Settings → API & Webhooks → Click "Test Webhook"

### 4. Create Payment Link:

Settings → Billing → Choose Plan → Creates Razorpay link

---

## Common Next Steps

1. **Configure Email Templates** in SendGrid
2. **Test SMS delivery** with test phone number
3. **Authorize Slack app** to your workspace
4. **Verify Razorpay credentials** in dashboard
5. **Set up webhook receiver** on external service

---

## Troubleshooting

**Q: "Not authenticated" error in Convex**
→ Check auth is configured. Ensure user is logged in.

**Q: Mutations not saving to database**
→ Run `npx convex dev` and check dashboard for errors

**Q: Email not sending**
→ Verify SENDGRID_API_KEY is correct and has SMS credits

**Q: Webhook test fails**
→ Check webhook URL is public. Test with `curl` from terminal

---

## Next Priority (from your list):

1. ✅ **Backend Integration** - Settings now sync to Convex
2. 🔄 **API Tests** - Implement webhook and automation testing
3. 🔄 **Email/SMS Gateways** - Already set up, just activate in settings
4. 🔄 **Payment Processing** - Razorpay ready, configure billing plans
5. 🔄 **Analytics** - Usage tracking infrastructure ready

---

## Support Files

- **🔵 IMPLEMENTATION_ROADMAP.md** - Detailed implementation plan
- **🔵 BACKEND_INTEGRATION_GUIDE.md** - Complete integration documentation
- **🟢 convex/schema.additions.ts** - Database schema definitions
- **🟢 convex/settings.ts** - Organization settings API
- **🟢 convex/notifications.ts** - Notification rules API
- **🟢 convex/integrations.ts** - Integration management API
- **🟢 convex/api.ts** - API keys & webhooks API
- **🟢 convex/automation.ts** - Automation rules API
- **🟢 convex/auditLog.ts** - Audit trail API
- **🟡 convex/lib/email.ts** - Email service (SendGrid)
- **🟡 convex/lib/sms.ts** - SMS service (Twilio)
- **🟡 convex/lib/slack.ts** - Slack integration
- **🟡 convex/lib/webhooks.ts** - Webhook management
- **🟡 convex/lib/payments.ts** - Payment processing (Razorpay)
- **🟡 convex/lib/analytics.ts** - Analytics tracking
- **🟡 src/lib/webhookTest.ts** - Webhook testing utilities
- **🟡 src/hooks/useSettings.ts** - React hooks for settings
- **🟡 src/types/settings.ts** - TypeScript interfaces

---

## Code Colors Key

- 🔵 Database Schema
- 🟢 Convex API Functions
- 🟡 Service Libraries
- 🟠 React Components
- 🔴 Not Applied Yet

---

Ready to ship! 🎉
