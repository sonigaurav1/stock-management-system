/\*\*

- 30-DAY ACTION PLAN
- Your complete roadmap to activate backend integration
  \*/

# 🗺️ 30-Day Backend Integration Roadmap

## Week 1: Setup & Configuration

### Day 1: Environment Setup (2 hours)

- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Sign up for SendGrid (email) - `app.sendgrid.com`
- [ ] Get API key and add to `.env.local`
- [ ] Sign up for Twilio (SMS) - `twilio.com`
- [ ] Get Account SID, Auth Token, phone number
- [ ] Add to `.env.local`

**Deliverable:** .env.local configured with email/SMS keys

### Day 2: Payment & Slack Setup (2 hours)

- [ ] Sign up for Razorpay (payments) - `razorpay.com`
- [ ] Get Key ID and Key Secret
- [ ] Add to `.env.local`
- [ ] Create Slack workspace (or use existing)
- [ ] Create bot app at `api.slack.com/apps`
- [ ] Get Bot Token and Signing Secret
- [ ] Add to `.env.local`

**Deliverable:** All third-party service credentials in .env.local

### Day 3: Convex Schema Extension (3 hours)

- [ ] Read `convex/schema.additions.ts`
- [ ] Open `convex/schema.ts`
- [ ] Add all new table definitions from additions file
- [ ] Run: `npx convex dev`
- [ ] Wait for types to generate
- [ ] Verify no errors in console

**Deliverable:** Extended Convex schema with 8 new tables

### Day 4: Dependency Installation & Testing (2 hours)

- [ ] Run: `npm install @sendgrid/mail twilio @slack/bolt razorpay`
- [ ] Verify installations: `npm ls`
- [ ] Test Convex functions locally:
  ```bash
  npx convex dev  # Keep running
  ```
- [ ] Open Convex dashboard
- [ ] Verify all new functions listed

**Deliverable:** Dependencies installed, Convex functions available

### Day 5: Review & Documentation Reading (2 hours)

- [ ] Read `QUICK_SETUP_GUIDE.md`
- [ ] Read `BACKEND_INTEGRATION_GUIDE.md` (skim through)
- [ ] Read `ARCHITECTURE_DIAGRAM.md`
- [ ] Understand data flow
- [ ] List any questions

**Deliverable:** Team understanding of architecture

---

## Week 2: Settings Component Integration

### Day 6: Update Organization Settings Component (3 hours)

**Current code:**

```typescript
const [settings, setSettings] = useState(mockData);
```

**New code:**

```typescript
import { useOrganizationSettings } from '@/hooks/useSettings';

export function OrganizationSettings() {
  const { settings, updateSettings, isLoading } = useOrganizationSettings();

  const handleSubmit = async (formData: any) => {
    await updateSettings(formData);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}
```

- [ ] Update `src/features/settings/components/OrganizationSettings.tsx`
- [ ] Replace mock data with `useOrganizationSettings` hook
- [ ] Add loading and error states
- [ ] Test: Fill form and verify data saves to Convex

**Deliverable:** Organization settings saving to database

### Day 7: Update Notification Rules Component (2 hours)

- [ ] Update `src/features/settings/components/NotificationSettings.tsx`
- [ ] Replace with `useNotificationRules` hook
- [ ] Implement create/edit/delete flows
- [ ] Test: Create a notification rule

**Deliverable:** Notification rules saving to database

### Day 8: Update Integrations Component (2 hours)

- [ ] Update `src/features/settings/components/IntegrationsSettings.tsx`
- [ ] Replace with `useIntegrations` hook
- [ ] Implement connect/disconnect flows
- [ ] Test: Connect an integration

**Deliverable:** Integrations saving to database

### Day 9: Update API & Webhooks Component (3 hours)

- [ ] Update `src/features/settings/components/ApiSettings.tsx`
- [ ] Replace with `useApiKeys` hook for API key management
- [ ] Add webhook creation flow
- [ ] Test webhook button: "Test Webhook"
- [ ] All tests should show success

**Deliverable:** API keys and webhooks saving to database

### Day 10: Update Automation Component (2 hours)

- [ ] Update `src/features/settings/components/AutomationSettings.tsx`
- [ ] Replace with `useAutomation` hook
- [ ] Implement rule creation/execution
- [ ] Test: Create and execute automation rule

**Deliverable:** Automation rules saving to database

---

## Week 3: Notification Channels Activation

### Day 11: Email Integration Activation (3 hours)

- [ ] Create SendGrid email campaign in dashboard
- [ ] Design email templates for:
  - Low Stock Alert
  - Invoice Created
  - Payment Received
  - Order Confirmation
- [ ] Get template IDs
- [ ] Update `convex/lib/email.ts` with template IDs
- [ ] Test sending email from settings component

**Deliverable:** First email sent from system

### Day 12: SMS Integration Activation (2 hours)

- [ ] Verify Twilio account has SMS balance
- [ ] Verify phone number is whitelisted
- [ ] Test sending SMS from settings component
- [ ] Verify SMS delivery (check phone)

**Deliverable:** First SMS sent from system

### Day 13: Slack Integration Activation (2 hours)

- [ ] In Slack workspace: Create test channel (#alerts)
- [ ] In Slack bot app: Install app to workspace
- [ ] Bot should appear in your workspace
- [ ] Test posting message from settings
- [ ] Verify message appears in channel

**Deliverable:** First Slack message sent from system

### Day 14: Notification Testing (2 hours)

- [ ] Create notification rule: Low Stock Alert
- [ ] Select Email, SMS, Slack channels
- [ ] Click "Test Notification"
- [ ] Verify receipt in all 3 channels
- [ ] Document any issues

**Deliverable:** Multi-channel notification working

### Day 15: Email Template Setup Completion (2 hours)

- [ ] Finalize all 5 email templates in SendGrid
- [ ] Test each template individually
- [ ] Set up sender authentication (DKIM)
- [ ] Create welcome email template

**Deliverable:** All email templates production-ready

---

## Week 4: Webhook System Implementation

### Day 16: Webhook Receiver Setup (4 hours)

Create a simple webhook receiver to test deliveries.

**Option 1: Use ngrok (Easy)**

- Install ngrok: `brew install ngrok` (Mac) or download
- Run: `ngrok http 3001`
- Get forward URL: `https://xxxxx.ngrok.io`

**Option 2: Firebase Functions (Medium)**

- Create Firebase function endpoint
- Log incoming payloads
- Deploy

**Deliverable:** Public webhook receiver URL

### Day 17: Webhook Testing (3 hours)

- [ ] Add webhook URL to settings
- [ ] Click "Test Webhook"
- [ ] Verify:

  - [ ] Signature header is present
  - [ ] Signature is valid
  - [ ] Timestamp header is present
  - [ ] Response code is 200

- [ ] Test with different event types

**Deliverable:** Webhook test passing

### Day 18: Webhook Event Triggers (3 hours)

Implement webhook triggers on key events:

- [ ] Product created → Trigger webhook
- [ ] Stock level changed → Trigger webhook
- [ ] Order created → Trigger webhook
- [ ] Invoice generated → Trigger webhook
- [ ] Payment received → Trigger webhook

Add trigger logic:

```typescript
// In product creation endpoint
await triggerWebhooks(webhooks, 'product.created', {
  productId: product._id,
  name: product.name,
  ...
});
```

**Deliverable:** Webhooks triggering on events

### Day 19: Webhook Retry Logic Testing (2 hours)

- [ ] Simulate webhook failure (temporarily disable receiver)
- [ ] Trigger webhook
- [ ] Verify retry attempts (exponential backoff)
- [ ] Check logs for:
  - Attempt 1: failed
  - Attempt 2: after 1s
  - Attempt 3: after 2s
  - etc.

**Deliverable:** Retry mechanism verified

### Day 20: Webhook History & Logs (2 hours)

- [ ] View webhook execution logs in UI
- [ ] See status (success/failed)
- [ ] See response time
- [ ] See error messages (if any)
- [ ] Filter by event type

**Deliverable:** Webhook monitoring dashboard working

---

## Week 5: Payment Processing & Analytics

### Day 21: Payment Link Setup (2 hours)

- [ ] In Razorpay dashboard: Create 3 billing plans
  - Starter: ₹499/month
  - Professional: ₹1299/month
  - Enterprise: ₹3499/month
- [ ] Update plan names/descriptions in UI
- [ ] Click "Upgrade Plan" on each billing tier

**Deliverable:** First payment link created

### Day 22: Payment Verification (3 hours)

- [ ] Create test payment link
- [ ] Go to link and complete mock test payment
- [ ] Verify payment webhook received in receiver
- [ ] Verify payment marked as "paid" in system
- [ ] Verify invoice auto-generated

**Deliverable:** Complete payment flow working

### Day 23: Payment Failing & Refunds (2 hours)

Test edge cases:

- [ ] Cancel payment mid-flow
- [ ] Verify cancellation logged
- [ ] Simulate refund from Razorpay dashboard
- [ ] Verify refund reflects in system
- [ ] Send refund notification to customer

**Deliverable:** Payment failure/refund handling works

### Day 24: Analytics Tracking Implementation (3 hours)

Add tracking to key actions:

```typescript
const analytics = new AnalyticsClient(userId);

// On settings update
await analytics.track('organization_settings.updated', 'update', {
  field: 'companyName'
});

// On webhook trigger
await analytics.track('webhook.triggered', 'trigger', {
  event: 'product.created',
  success: true
});

// On automation execution
await analytics.track('automation_rule.executed', 'execute', {
  ruleName: 'low_stock_alert',
  result: 'success'
});
```

- [ ] Add analytics calls to all major actions
- [ ] Test tracking events via `/api/analytics`
- [ ] Verify events logged in Convex

**Deliverable:** Analytics events being tracked

### Day 25: Analytics Dashboard (2 hours)

- [ ] Build analytics dashboard view showing:
  - Daily Active Users
  - Feature Usage Breakdown
  - Top Features Used
  - Settings Changes Over Time
  - Automation Rule Executions

**Deliverable:** Analytics dashboard displaying usage metrics

---

## Week 5: Monitoring, Security & Final Testing

### Day 26: Error Handling & Logging (3 hours)

- [ ] Verify all errors logged to console
- [ ] Check Convex error logs
- [ ] Implement error monitoring (Sentry optional)
- [ ] Set up alerts for critical errors:
  - Webhook delivery failures (3+ in a row)
  - Payment processing failures
  - Service integration failures
  - Database errors

**Deliverable:** Error monitoring & alerting working

### Day 27: Security Audit (3 hours)

- [ ] Verify all API keys hidden in UI
- [ ] Verify all secrets encrypted in DB
- [ ] Test webhook signature verification
- [ ] Verify rate limiting on API keys
- [ ] Check audit logs contain all actions

Security checklist:

- [ ] No API keys in console logs
- [ ] No secrets in error messages
- [ ] Auth required on all endpoints
- [ ] CORS properly configured
- [ ] Input validation on all endpoints

**Deliverable:** Security audit passed

### Day 28: Performance Testing (2 hours)

- [ ] Test with 1000 concurrent webhook deliveries
- [ ] Profile API endpoints response times
- [ ] Verify < 200ms for most operations
- [ ] Check database query performance
- [ ] Monitor Convex usage limits

**Deliverable:** Performance benchmarked

### Day 29: Integration Testing (3 hours)

Run complete E2E test scenarios:

**Scenario 1: New Organization Signup**

- [ ] Create account
- [ ] Fill organization settings
- [ ] Create notification rule
- [ ] Connect integration
- [ ] Generate API key
- [ ] Register webhook
- [ ] Everything persists

**Scenario 2: Product Low Stock Alert**

- [ ] Create product
- [ ] Set reorder level
- [ ] Manually trigger low stock
- [ ] Verify email sent
- [ ] Verify SMS sent
- [ ] Verify Slack message
- [ ] Verify webhook triggered
- [ ] Verify logged to audit log

**Scenario 3: Order Payment Flow**

- [ ] Create order
- [ ] Click "Pay Now"
- [ ] Complete payment
- [ ] Verify payment marked paid
- [ ] Verify invoice generated
- [ ] Verify receipt sent
- [ ] Verify revenue tracked

**Deliverable:** All scenarios passing

### Day 30: Production Deployment Prep (3 hours)

- [ ] Create production environment variables
- [ ] Deploy Convex to production
- [ ] Set production URLs in all endpoints
- [ ] Configure production webhooks
- [ ] Set production Razorpay credentials
- [ ] Set production email/SMS credentials
- [ ] Create backup & restore procedures
- [ ] Document runbook for incidents
- [ ] Schedule team training

**Deliverable:** System ready for production launch

---

## After Launch

### Monitoring (Daily)

- [ ] Check error logs
- [ ] Monitor Convex usage
- [ ] Verify webhook deliveries
- [ ] Check payment processing
- [ ] Review failed notifications

### Maintenance (Weekly)

- [ ] Backup database
- [ ] Review security logs
- [ ] Check performance metrics
- [ ] Answer user support tickets

### Improvements (Monthly)

- [ ] Gather user feedback
- [ ] Analyze usage analytics
- [ ] Optimize slow operations
- [ ] Add new notifications
- [ ] Improve email templates

---

## Success Metrics

Track these metrics to measure success:

| Metric                     | Target  | Current |
| -------------------------- | ------- | ------- |
| Settings save success rate | > 99%   | \_\_\_  |
| Webhook delivery rate      | > 98%   | \_\_\_  |
| Email delivery rate        | > 95%   | \_\_\_  |
| SMS delivery rate          | > 99%   | \_\_\_  |
| Payment success rate       | > 99%   | \_\_\_  |
| API response time          | < 200ms | \_\_\_  |
| System uptime              | > 99.9% | \_\_\_  |
| Data persistence           | 100%    | \_\_\_  |

---

## Common Issues & Quick Fixes

### Settings not saving?

```bash
# Check Convex is running
npx convex dev

# Check auth is configured
# Check user is logged in
# Look for errors in browser console
```

### Emails not sending?

```
Check: SENDGRID_API_KEY is correct
Check: Sender email is verified in SendGrid
Check: Template ID exists
Check: Email recipient is not in spam list
```

### Webhooks not delivering?

```
Check: URL is publicly accessible (curl from terminal)
Check: Returns 2xx status code
Check: Receives all headers (X-Webhook-Signature, etc)
Check: Signature verification logic is correct
```

### Payments not creating?

```
Check: RAZORPAY_KEY_ID and KEY_SECRET are correct
Check: Account is activated
Check: Amount is in paise (multiply by 100)
Check: Email and phone are valid
```

---

## Support Resources

- 📖 QUICK_SETUP_GUIDE.md - Fast overview
- 📖 BACKEND_INTEGRATION_GUIDE.md - Detailed docs
- 📖 TESTING_GUIDE.md - Testing procedures
- 📖 ARCHITECTURE_DIAGRAM.md - System design
- 💬 Slack: #inventory-dev channel
- 📧 support@inventorysystem.com

---

## Sign-Off Checklist

When all 30 days complete, verify:

- [ ] All environment variables configured
- [ ] Convex schema extended
- [ ] All API functions working
- [ ] Settings UI integrated
- [ ] Email delivery working
- [ ] SMS delivery working
- [ ] Slack integration working
- [ ] Webhooks being triggered
- [ ] Payments processing
- [ ] Analytics tracking
- [ ] Audit logs recording
- [ ] Error handling working
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] E2E tests passing
- [ ] Team trained
- [ ] Runbooks documented
- [ ] Production ready

---

## Timeline Summary

```
Week 1 (Setup)           ████░░░░░░░░░░░░░░░░
Week 2 (Components)      ░░░░████░░░░░░░░░░░░
Week 3 (Notifications)   ░░░░░░░░████░░░░░░░░
Week 4 (Webhooks)        ░░░░░░░░░░░░████░░░░
Week 5 (Payments+Go)     ░░░░░░░░░░░░░░░░████

Total: 30 days to production ✓
```

---

Ready to start? Begin with **Day 1** in Week 1!

Need help? Read `QUICK_SETUP_GUIDE.md` first.

Questions? Check `BACKEND_INTEGRATION_GUIDE.md`.

Let's ship it! 🚀
