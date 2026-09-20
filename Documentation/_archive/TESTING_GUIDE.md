/\*\*

- TESTING & VALIDATION GUIDE
- Complete guide for testing the backend integration
  \*/

# Testing & Validation Guide

## Unit Tests

### 1. Test Convex Functions

Create `convex/settings.test.ts`:

```typescript
import { expect, test } from 'vitest';
import { internal } from './_generated/api';

describe('Settings API', () => {
  test('should update organization settings', async () => {
    const ctx = createMockContext();
    const result = await updateOrganizationSettings.handler(ctx, {
      companyName: 'Test Corp',
      businessType: 'retail',
      taxNumber: 'TAX123'
      // ... other fields
    });
    expect(result).toBeDefined();
  });

  test('should get organization settings', async () => {
    const ctx = createMockContext();
    const result = await getOrganizationSettings.handler(ctx, {});
    expect(result).toBeNull(); // First time should be empty
  });
});
```

### 2. Test Service Libraries

Create `convex/lib/__tests__/email.test.ts`:

```typescript
import { test, expect } from 'vitest';
import { emailTemplateData } from '../email';

describe('Email Templates', () => {
  test('should generate low stock alert template', () => {
    const template = emailTemplateData.lowStockAlert('Widget', 5, 20);
    expect(template.productName).toBe('Widget');
    expect(template.currentStock).toBe(5);
    expect(template.reorderLevel).toBe(20);
  });
});
```

---

## Integration Tests

### 1. Test Webhook Flow

Create `test/webhooks.integration.test.ts`:

```typescript
import { test, expect } from 'vitest';
import {
  executeWebhook,
  generateWebhookSignature,
  verifyWebhookSignature
} from '@/convex/lib/webhooks';

test('webhook signature verification', () => {
  const payload = JSON.stringify({ test: 'data' });
  const secret = 'test-secret';

  const signature = generateWebhookSignature(payload, secret);
  const isValid = verifyWebhookSignature(payload, signature, secret);

  expect(isValid).toBe(true);
});

test('webhook execution with retry', async () => {
  // Mock fetch
  let attempts = 0;
  global.fetch = vi.fn(async () => {
    attempts++;
    if (attempts < 2) {
      return { status: 500, text: async () => 'Error' };
    }
    return { status: 200, text: async () => 'Success' };
  });

  const result = await executeWebhook(
    'https://example.com/webhook',
    { event: 'test', timestamp: Date.now(), data: {} },
    'secret',
    5
  );

  expect(result.success).toBe(true);
  expect(attempts).toBe(2); // Should retry once
});
```

### 2. Test Payment Flow

Create `test/payments.integration.test.ts`:

```typescript
import { test, expect, vi } from 'vitest';
import { verifyPayment } from '@/convex/lib/payments';

test('payment verification', async () => {
  // Mock Razorpay response
  const mockPayment = {
    id: 'pay_123',
    status: 'captured',
    amount: 99900,
    currency: 'INR'
  };

  const result = await verifyPayment('pay_123', 'ord_456', 'sig_789');
  expect(result.success).toBe(true);
});
```

---

## E2E Tests

### 1. Test Settings Page Flow

Create `e2e/settings.e2e.test.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('update organization settings', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:3000/sign-in');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  await page.waitForNavigation();

  // 2. Navigate to settings
  await page.goto('http://localhost:3000/settings/organization');
  await page.waitForLoadState('networkidle');

  // 3. Fill form
  await page.fill('input[name="companyName"]', 'Test Company');
  await page.fill('input[name="email"]', 'company@example.com');
  await page.fill('input[name="phone"]', '+919999999999');

  // 4. Submit
  await page.click('button:has-text("Save Changes")');

  // 5. Verify success message
  await expect(page.locator('text=Settings updated')).toBeVisible();

  // 6. Verify data persisted (reload page)
  await page.reload();
  await expect(page.locator('input[name="companyName"]')).toHaveValue(
    'Test Company'
  );
});

test('create and test webhook', async ({ page }) => {
  await page.goto('http://localhost:3000/settings/api');

  // Add webhook
  await page.fill('input[name="webhookUrl"]', 'https://example.com/webhook');
  await page.click('button[name="addWebhook"]');

  // Test webhook
  await page.click('button:has-text("Test")');

  // Verify test result
  await expect(page.locator('text=Request successful')).toBeVisible();
});
```

---

## Manual Testing Checklist

### Organization Settings

- [ ] Load organization settings page
- [ ] Fill all form fields
- [ ] Click "Save Changes"
- [ ] Verify success toast
- [ ] Reload page - data persists
- [ ] Change one field and save
- [ ] Verify audit log entry created

### Notification Rules

- [ ] Create new rule
- [ ] Select multiple triggers
- [ ] Select multiple channels
- [ ] Add recipients
- [ ] Click "Create Rule"
- [ ] Verify rule appears in list
- [ ] Edit rule
- [ ] Delete rule

### Integrations

- [ ] Click "Connect" on integration
- [ ] Paste API credentials
- [ ] Click "Connect"
- [ ] Verify "Connected" status
- [ ] Click "Test Sync"
- [ ] View sync status
- [ ] Disconnect integration

### API & Webhooks

- [ ] Generate new API key
- [ ] Copy key (shown only once)
- [ ] Save key securely
- [ ] View key list (masked display)
- [ ] Revoke key
- [ ] Add webhook URL
- [ ] Select events
- [ ] Click "Test Webhook"
- [ ] View test results

### Automation Rules

- [ ] Create automation rule
- [ ] Select trigger type
- [ ] Select action
- [ ] Set threshold
- [ ] Enable rule
- [ ] Execute rule manually
- [ ] View execution history
- [ ] Edit rule
- [ ] Disable rule

### Notifications

- [ ] Configure email channel
- [ ] Configure SMS channel
- [ ] Configure Slack channel
- [ ] Set quiet hours
- [ ] Select notification categories
- [ ] Test email delivery
- [ ] Test SMS delivery
- [ ] Test Slack delivery

---

## API Testing (cURL)

### Update Organization Settings

```bash
curl -X POST http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "action": "update-organization",
    "companyName": "Acme Corp",
    "businessType": "retail",
    "taxNumber": "TAX123ABC",
    "gstNumber": "18AABCT1234H1Z5",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "MH",
    "country": "India",
    "email": "contact@acmecorp.com"
  }'
```

### Create Notification Rule

```bash
curl -X POST http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "action": "create-notification-rule",
    "name": "Low Stock Alert",
    "triggers": ["stock_low"],
    "channels": ["email", "sms"],
    "recipients": ["admin@company.com", "+919999999999"]
  }'
```

### Test Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "action": "test",
    "url": "https://example.com/webhook",
    "secret": "webhook-secret-key",
    "eventType": "test.event"
  }'
```

### Create Payment Link

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "action": "create-payment-link",
    "orderId": "ord_123456",
    "amount": 9999,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+919999999999",
    "description": "Order for products"
  }'
```

### Track Analytics Event

```bash
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "userId": "user_123",
    "feature": "organization_settings.updated",
    "action": "update",
    "metadata": {
      "field": "companyName",
      "oldValue": "Old Corp",
      "newValue": "New Corp"
    }
  }'
```

---

## Performance Testing

### Load Test Settings API

```bash
# Using Apache Bench
ab -n 1000 -c 10 \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -p settings-payload.json \
  http://localhost:3000/api/settings

# Expected: < 200ms response time for 95% of requests
```

### Load Test Webhooks

```bash
# Simulate 100 concurrent webhook deliveries
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/webhooks \
    -d '...' &
done
wait

# Expected: All webhooks delivered within 5 minutes
```

---

## Debugging

### Check Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project
3. Click "Data" tab
4. View `organizationSettings` table
5. Check recent entries

### Enable Verbose Logging

```typescript
// In convex/settings.ts
export const updateOrganizationSettings = mutation({
  args: { /* ... */ },
  async handler(ctx, args) {
    console.debug('Updating settings:', args);
    try {
      const result = await ctx.db.insert(...);
      console.debug('Settings saved:', result);
      return result;
    } catch (error) {
      console.error('Settings save failed:', error);
      throw error;
    }
  }
});
```

### Check Browser Console

- DevTools → Console tab for client-side errors
- DevTools → Network tab for API calls
- DevTools → Application tab to check Convex connection

---

## Success Criteria

✅ All manual tests pass  
✅ All unit tests pass  
✅ E2E tests pass  
✅ Performance tests acceptable  
✅ No console errors  
✅ Data persists after refresh  
✅ Webhooks deliver successfully  
✅ Payments process correctly  
✅ Analytics events tracked

---

## Troubleshooting Test Failures

**Test: "Settings not updating"**
→ Check Convex deployment. Run `npx convex dev`

**Test: "Webhook delivery failing"**
→ Verify webhook URL is publicly accessible with `curl`

**Test: "Payment link not created"**
→ Check Razorpay credentials in .env.local

**Test: "Navigation timeout"**
→ Increase Playwright timeout or check server is running
