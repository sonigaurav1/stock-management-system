/\*\*

- BACKEND INTEGRATION GUIDE
- Complete guide for implementing settings with Convex, webhooks, payments, and notifications
  \*/

# Backend Integration Guide

## Overview

This guide documents the implementation of:

1. **Settings Persistence** - Store app configuration in Convex
2. **Notification System** - Email, SMS, Slack integrations
3. **Webhook Management** - Event-driven architecture
4. **Payment Processing** - Razorpay integration
5. **Analytics Tracking** - Feature usage monitoring

---

## Phase 1: Extend Convex Schema

### 1. Update `convex/schema.ts`

Add the following tables to your schema definition:

```typescript
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ...existing tables...

  // NEW: Settings Tables
  organizationSettings: defineTable({
    userId: v.string(),
    companyName: v.string(),
    businessType: v.string(),
    taxNumber: v.string(),
    gstNumber: v.string()
    // ... other fields
  }).index('by_user', ['userId']),

  notificationRules: defineTable({
    userId: v.string(),
    name: v.string(),
    triggers: v.array(v.string()),
    channels: v.array(v.string()),
    recipients: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId'])

  // ... more tables from schema.additions.ts
});
```

See `convex/schema.additions.ts` for complete schema definitions.

### 2. Generate Convex Types

```bash
npx convex dev
```

This will regenerate the Convex API types automatically.

---

## Phase 2: Create Convex Database Functions

Files created:

- `convex/settings.ts` - Organization settings CRUD
- `convex/notifications.ts` - Notification rules management
- `convex/integrations.ts` - Third-party integrations
- `convex/api.ts` - API keys and webhook management
- `convex/automation.ts` - Automation rules
- `convex/auditLog.ts` - Audit trail logging

### Usage in React Components

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';

export function MyComponent() {
  const settings = useQuery(api.settings.getOrganizationSettings);
  const updateSettings = useMutation(api.settings.updateOrganizationSettings);

  const handleUpdate = async (data: any) => {
    await updateSettings(data);
  };

  return (
    // Component JSX
  );
}
```

---

## Phase 3: Setup Notification Gateways

### Email (SendGrid)

1. **Install dependency:**

   ```bash
   npm install @sendgrid/mail
   ```

2. **Set environment variable:**

   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@inventorysystem.com
   ```

3. **Usage:**

   ```typescript
   import { sendEmail, emailTemplates } from '@/convex/lib/email';

   await sendEmail({
     to: 'user@example.com',
     templateId: emailTemplates.LOW_STOCK,
     templateData: emailTemplateData.lowStockAlert('Product X', 5, 20)
   });
   ```

### SMS (Twilio)

1. **Install dependency:**

   ```bash
   npm install twilio
   ```

2. **Set environment variables:**

   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1...
   ```

3. **Usage:**

   ```typescript
   import { sendSMS, smsTemplates } from '@/convex/lib/sms';

   await sendSMS({
     to: '+91...',
     message: smsTemplates.lowStockAlert('Product X', 5)
   });
   ```

### Slack Integration

1. **Install dependency:**

   ```bash
   npm install @slack/bolt
   ```

2. **Set environment variables:**

   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_SIGNING_SECRET=...
   ```

3. **Usage:**

   ```typescript
   import { postSlackMessage } from '@/convex/lib/slack';

   await postSlackMessage({
     channel: '#alerts',
     blocks: slackMessageBlocks.lowStockAlert(...)
   });
   ```

---

## Phase 4: Webhook System

### How It Works

1. **Webhook Registration**: User registers webhook URL in settings
2. **Event Trigger**: When event occurs, system triggers registered webhooks
3. **Signature Verification**: Receiving endpoint verifies request signature
4. **Retry Logic**: Failed webhooks retry with exponential backoff
5. **Logging**: All attempts logged for debugging

### Implementation Steps

1. **Store Webhook URL:**

   ```typescript
   const webhookId = await updateMutation(api.api.createWebhook, {
     url: 'https://example.com/webhook',
     events: ['product.created', 'stock.updated']
   });
   ```

2. **Trigger Webhook on Event:**

   ```typescript
   import { triggerWebhooks } from '@/convex/lib/webhooks';

   // When product is created:
   await triggerWebhooks(registeredWebhooks, 'product.created', {
     productId: 'prod_123',
     name: 'New Product'
   });
   ```

3. **Verify Webhook Signature (on receiving end):**

   ```typescript
   import { verifyWebhookSignature } from '@/convex/lib/webhooks';

   const isValid = verifyWebhookSignature(
     requestBody,
     signature,
     webhookSecret
   );
   ```

4. **Test Webhook:**
   ```typescript
   // Use the webhook test endpoint from components
   const result = await testWebhook(webhookUrl, secret);
   ```

---

## Phase 5: Payment Processing (Razorpay)

### Setup

1. **Install dependency:**

   ```bash
   npm install razorpay
   ```

2. **Set environment variables:**
   ```
   RAZORPAY_KEY_ID=...
   RAZORPAY_KEY_SECRET=...
   ```

### Create Payment Link

```typescript
import { createPaymentLink } from '@/convex/lib/payments';

const result = await createPaymentLink({
  orderId: 'ord_123',
  amount: 5999,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+91...',
  description: 'Order for products'
});

// Share result.paymentLinkUrl with customer
```

### Verify Payment

```typescript
import { verifyPayment } from '@/convex/lib/payments';

const result = await verifyPayment(paymentId, orderId, signature);
if (result.success) {
  // Payment verified, update order status
}
```

### Process Refund

```typescript
import { processRefund } from '@/convex/lib/payments';

const result = await processRefund(paymentId, amount);
```

---

## Phase 6: Implement Settings Hooks

Custom hooks for each settings module:

```typescript
import {
  useOrganizationSettings,
  useNotificationRules,
  useIntegrations,
  useApiKeys,
  useAutomation
} from '@/hooks/useSettings';

export function OrganizationSettings() {
  const { settings, updateSettings, isLoading } = useOrganizationSettings();

  if (isLoading) return <Skeleton />;

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await updateSettings(formData);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Phase 7: Connect Settings UI to Backend

### Update OrganizationSettings Component

**Before (Mock Data):**

```typescript
const [settings, setSettings] = useState(mockData);
```

**After (Convex Integration):**

```typescript
import { useOrganizationSettings } from '@/hooks/useSettings';

const { settings, updateSettings, isLoading } = useOrganizationSettings();

const handleSubmit = async (data: any) => {
  await updateSettings(data);
};
```

### Apply Same Pattern to Other Settings Modules

- NotificationSettings → useNotificationRules
- IntegrationSettings → useIntegrations
- ApiSettings → useApiKeys
- AutomationSettings → useAutomation

---

## Phase 8: Error Handling & Validation

```typescript
try {
  await updateSettings(data);
  toast({ title: 'Success', description: 'Settings updated' });
} catch (error) {
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive'
  });
}
```

---

## Phase 9: Analytics Integration

Track feature usage:

```typescript
import { AnalyticsClient } from '@/convex/lib/analytics';

const analytics = new AnalyticsClient(userId);

// Track settings update
await analytics.track('organization_settings.updated', 'update', {
  setting: 'companyName',
  oldValue: 'X',
  newValue: 'Y'
});

// Track integration sync
await analytics.track('integration.synced', 'sync', {
  integrationName: 'tally',
  status: 'success'
});

// Track automation execution
await analytics.track('automation_rule.executed', 'execute', {
  ruleName: 'low_stock_alert',
  result: 'success'
});
```

---

## Testing Your Implementation

### 1. Test Organization Settings

```bash
curl -X POST http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update-organization",
    "companyName": "Test Corp"
  }'
```

### 2. Test Webhook

```bash
# From Settings → API & Webhooks → Test Webhook Button
# Or use webhook test utility:

import { testWebhook } from '@/lib/webhookTest';
const result = await testWebhook(webhookUrl, secret);
```

### 3. Test Payment Link

```typescript
const paymentLink = await fetch('/api/payments', {
  method: 'POST',
  body: JSON.stringify({
    action: 'create-payment-link',
    orderId: 'ord_123',
    amount: 999,
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    customerPhone: '+919999999999'
  })
});
```

### 4. Test Analytics

```typescript
await fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user_123',
    feature: 'organization_settings.updated',
    action: 'update',
    metadata: { field: 'companyName' }
  })
});
```

---

## Deployment Checklist

- [ ] Extended Convex schema with all new tables
- [ ] Created all Convex API functions (mutations/queries)
- [ ] Set up environment variables for all services
- [ ] Installed required npm packages
- [ ] Updated settings components with Convex hooks
- [ ] Tested organization settings CRUD
- [ ] Tested notification delivery (email/SMS/Slack)
- [ ] Tested webhook registration and delivery
- [ ] Tested payment link creation and verification
- [ ] Verified analytics tracking is working
- [ ] Updated Convex deployment
- [ ] Set up .env.local with all API keys

---

## Common Issues & Solutions

### Issue: "Not authenticated" error

**Solution:** Ensure auth middleware is properly configured and user is logged in.

### Issue: Webhooks not delivering

**Solution:** Check webhook URL is publicly accessible and returns 2xx status code.

### Issue: SMS not sending

**Solution:** Verify Twilio phone number is activated and has SMS balance.

### Issue: Payment link not created

**Solution:** Check Razorpay credentials are correct and merchant account is activated.

---

## Next Steps

1. ✅ Create API endpoints
2. ✅ Integrate with settings UI
3. Implement payment webhooks
4. Set up email templates in SendGrid
5. Configure Slack bot permissions
6. Build analytics dashboard
7. Create admin monitoring panel
8. Set up monitoring/alerts
