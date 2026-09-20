/\*\*

- ARCHITECTURE & DATA FLOW DIAGRAM
- Visual overview of the complete backend integration
  \*/

# Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INVENTORY MANAGEMENT SYSTEM                     │
└─────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │  Web Browser │
                                    │  (React UI)  │
                                    └────────┬─────┘
                                             │
                        ┌────────────────────┼────────────────────┐
                        │                    │                    │
                        ▼                    ▼                    ▼
              ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐
              │  Settings Pages  │  │ Hooks Layer  │  │ API Endpoints  │
              │ (React Comps)    │  │ useSettings  │  │ /api/*         │
              └────────┬─────────┘  └──────┬───────┘  └────────┬───────┘
                       │                   │                  │
            ┌──────────┴───────────────────┴──────────────────┘
            │
            ▼
    ┌───────────────────┐
    │  Convex Backend   │ ◄─────── Multi-tenant Database
    │  (Server Logic)   │
    └─────┬────────────┬┼───┬────────┬──────┬────────┬──────┐
          │            │    │        │      │        │      │
  ┌───────▼──────┐    │    │        │      │        │      │
  │   settings   │    │    │        │      │        │      │
  │ notifications│    │    │        │      │        │      │
  │ integrations │────┘    │        │      │        │      │
  │    api       │         │        │      │        │      │
  │ automation   │         │        │      │        │      │
  │  auditLog    │         │        │      │        │      │
  └──────────────┘         │        │      │        │      │
           ▲               │        │      │        │      │
           │               │        │      │        │      │
           │        ┌──────▼──┐     │      │        │      │
           │        │  lib/   │     │      │        │      │
           │        │ email   │◄────┼──────┼────────┼──────┼─► SendGrid
           │        │  sms    │     │      │        │      │
           │        │ slack   │◄────┼──────┼────────┼──────┼─► Slack API
           │        │webhooks │     │      │        │      │
           │        │payments │     │      │        │      │
           │        │analytics│     │      │        │      │
           │        └─────────┘     │      │        │      │
           │                        │      │        │      │
           └────────────────────────┘      │        │      │
                                           │        │      │
                          ┌────────────────▼────┐   │      │
                          │   /api/settings     │   │      │
                          │   /api/webhooks     │   │      │
                          │   /api/payments     │   │      │
                          │   /api/analytics    │   │      │
                          └────────┬───────────┘   │      │
                                   │               │      │
                                   │       ┌───────▼──┐   │
                                   │       │ Razorpay │   │
                                   │       │ Payments │   │
                                   │       └──────────┘   │
                                   │                      │
                                   │       ┌──────────┐   │
                                   │       │ Twilio   │◄──┘
                                   │       │   SMS    │
                                   │       └──────────┘
                                   │
                          ┌────────▼────────┐
                          │  External APIs  │
                          │   & Services    │
                          └─────────────────┘
```

---

## Data Flow: Organization Settings

```
User fills form
      ▼
┌─────────────────────────┐
│ OrganizationSettings    │
│ React Component         │
└────────────┬────────────┘
             │ updateSettings(data)
             ▼
┌─────────────────────────┐
│ useOrganizationSettings │
│ Custom Hook             │
└────────────┬────────────┘
             │ useMutation(api.settings.updateOrganizationSettings)
             ▼
┌─────────────────────────┐
│ convex/settings.ts      │
│ updateOrganizationSettings
│ mutation                │
└────────────┬────────────┘
             │ ctx.db.insert()
             ▼
┌─────────────────────────┐
│ organizationSettings    │
│ Convex Table            │
└────────────┬────────────┘
             │ Success ✓
             │ Log to auditLog
             ▼
┌─────────────────────────┐
│ Toast Notification      │
│ "Settings Updated"      │
└─────────────────────────┘

Query flow (Reading):
fetch settings
      ▼
useQuery(api.settings.getOrganizationSettings)
      ▼
convex/settings.ts: getOrganizationSettings
      ▼
Convex DB query
      ▼
Return to component
```

---

## Data Flow: Notification Rule Creation

```
Create Notification Rule
      ▼
┌─────────────────────────┐
│ NotificationRuleForm    │
│ React Component         │
└────────────┬────────────┘
             │ createRule(formData)
             ▼
┌─────────────────────────┐
│ useNotificationRules    │
│ Custom Hook             │
└────────────┬────────────┘
             │ useMutation(api.notifications.createNotificationRule)
             ▼
┌─────────────────────────┐
│ convex/notifications.ts │
│ createNotificationRule  │
│ mutation                │
└────────────┬────────────┘
             │ Validate input
             │
             ▼
┌─────────────────────────┐
│ notificationRules       │
│ Convex Table            │
└────────────┬────────────┘
             │ Success
             ▼
┌─────────────────────────┐
│ Log Action (auditLog)   │
│ Track Feature           │
└────────────┬────────────┘
             │
             ▼
┌──────────────────────────┐
│ Trigger Now (Optional)   │
└────────────┬─────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   Email       SMS/Slack (if chosen)
      │             │
      ▼             ▼
SendGrid    Twilio/Slack API
      │             │
      └──────┬──────┘
             │
             ▼
      ┌─────────────┐
      │ Delivered ✓ │
      └─────────────┘
```

---

## Data Flow: Webhook Event Trigger

```
Event Occurs (e.g., product.created)
      ▼
┌──────────────────────────┐
│ triggerWebhooks()        │
│ convex/lib/webhooks.ts   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Query registered         │
│ webhooks from DB         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ For each webhook:        │
│ - Generate HMAC-256      │
│ - Create payload         │
│ - Set headers            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ POST to webhook URL      │
│ Attempt 1                │
└────────────┬─────────────┘
             │
      ┌──────┴──────┐
      │             │
   Success       Failure (5xx/timeout)
      ▼             ▼
  Log ✓       ┌──────────────────┐
              │ Exponential       │
              │ Backoff Retry:    │
              │ - 1 second        │
              │ - 2 seconds       │
              │ - 4 seconds       │
              │ - 8 seconds       │
              │ - 16 seconds      │
              └────────┬──────────┘
                       │
                  ┌────┴────┐
                  │          │
               Success     Failed
                  ▼          ▼
              Log ✓      Log ✗
                         Alert Admin

┌────────────────────────────────┐
│ webhookExecutionLog table       │
│ Records all attempts            │
│ statusCode, response, error     │
└────────────────────────────────┘
```

---

## Data Flow: Payment Processing

```
Customer clicks "Pay Now"
      ▼
┌──────────────────────────┐
│ createPaymentLink()      │
│ convex/lib/payments.ts   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Call Razorpay API        │
│ Create payment link      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Razorpay creates link    │
│ Returns URL & ID         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Save payment status      │
│ Track in analytics       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Send link to customer    │
│ via email/SMS/Slack      │
└────────────┬─────────────┘
             │
             ▼
Customer visits link
      ▼
Razorpay payment page
      ▼
Payment made
      ▼
Razorpay sends webhook
      ▼
┌──────────────────────────┐
│ /api/payments            │
│ (webhook handler)        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ verifyPayment()          │
│ - Validate signature     │
│ - Check amount           │
│ - Update order status    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Generate invoice         │
│ Log transaction          │
│ Track revenue            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Send receipt to customer │
│ (email/SMS)              │
└──────────────────────────┘
```

---

## Data Flow: Analytics Tracking

```
User action happens
(e.g., create automation rule)
      ▼
┌──────────────────────────┐
│ analytics.track()        │
│ AnalyticsClient          │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ POST /api/analytics      │
│ Async request            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ trackFeatureUsage        │
│ mutation (convex)        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ featureUsage table       │
│ Insert event record      │
└────────────┬─────────────┘
             │
             ▼
Events accumulated over time
      ▼
┌──────────────────────────────┐
│ Analytics Dashboard          │
│ - Daily active users         │
│ - Feature adoption           │
│ - Top features used          │
│ - User engagement rates      │
└──────────────────────────────┘
```

---

## Integration Points

### External Services Connected

```
┌────────────────────────────────────────────────────────┐
│             Your Inventory System                      │
└────────────────────────────────────────────────────────┘
          │          │           │          │
          ▼          ▼           ▼          ▼
    ┌────────┐ ┌────────┐ ┌─────────┐┌────────┐
    │SendGrid│ │ Twilio │ │  Slack  ││ Razorpay
    │ Email  │ │  SMS   │ │  Chat   ││ Payments
    └────────┘ └────────┘ └─────────┘└────────┘
```

---

## Multi-tenancy Architecture

```
Convex Database
│
├─ User A
│  ├─ organizationSettings (indexed by userId)
│  ├─ notificationRules (indexed by userId)
│  ├─ integrations (indexed by userId)
│  ├─ apiKeys (indexed by userId)
│  ├─ webhooks (indexed by userId)
│  ├─ automationRules (indexed by userId)
│  ├─ auditLog (indexed by userId)
│  └─ featureUsage (indexed by userId)
│
├─ User B
│  ├─ organizationSettings (isolated)
│  ├─ notificationRules (isolated)
│  ├─ integrations (isolated)
│  └─ ... (all data isolated)
│
└─ User C
   └─ (same structure)

✓ All queries filtered by userId
✓ No data leak between tenants
✓ Scalable to millions of users
```

---

## Request/Response Flow

### Settings Update Request

```
REQUEST:
POST /api/settings HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>
User-Agent: Mozilla/5.0...

{
  "action": "update-organization",
  "companyName": "New Corp",
  "taxNumber": "TAX123ABC",
  "email": "contact@newcorp.com"
}

RESPONSE (Success):
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Settings updated"
}

OR

RESPONSE (Error):
HTTP/1.1 500 Internal Server Error

{
  "error": "Failed to update settings",
  "details": "..."
}
```

### Webhook Delivery Request

```
REQUEST:
POST https://example.com/webhook HTTP/1.1
Content-Type: application/json
X-Webhook-Signature: sha256=abc123def456...
X-Webhook-Timestamp: 1704067200000

{
  "event": "product.created",
  "timestamp": 1704067200000,
  "data": {
    "productId": "prod_123",
    "name": "New Widget",
    "price": 999.99,
    "stock": 50
  }
}

RESPONSE (Expected):
HTTP/1.1 200 OK

{ "received": true }
```

### Payment Link Response

```
REQUEST:
POST /api/payments HTTP/1.1

{
  "action": "create-payment-link",
  "orderId": "ord_123",
  "amount": 9999,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919999999999"
}

RESPONSE:
{
  "success": true,
  "paymentLinkId": "plink_123abc",
  "paymentLinkUrl": "https://rzp.io/l/abc123",
  "orderId": "ord_123",
  "amount": 9999
}
```

---

## Error Handling Flow

```
Operation starts
      │
      ▼
Try to execute
      │
      ├─ Success
      │   └─► Log success
      │       Return 200
      │
      └─ Error
          │
          ├─ Auth Error
          │   └─► Return 401
          │       Log to audit
          │
          ├─ Validation Error
          │   └─► Return 400
          │       Return error message
          │
          ├─ Database Error
          │   └─► Return 500
          │       Log error
          │       Alert admin
          │       Retry logic
          │
          └─ Service Error (Email/SMS/Payment)
              └─► Return 503
                  Queue for retry
                  Alert admin
                  Manual intervention
```

---

## Deployment Architecture

```
Development
│
├─ Local .env.local
├─ Local Convex (npx convex dev)
├─ Local API endpoints
└─ Mock external services

Staging
│
├─ staging.env
├─ Convex staging deployment
├─ Test webhooks.com
├─ Sandbox Razorpay/SendGrid
└─ Test user data

Production
│
├─ .env.production
├─ Convex production deployment
├─ Real webhooks
├─ Real Razorpay/SendGrid/Twilio
└─ Real customer data
    ├─ Daily backups
    ├─ Monitoring
    ├─ Alerting
    └─ Scaling
```

---

This architecture ensures:
✅ **Scalability** - Handles millions of events/requests  
✅ **Reliability** - Retry logic, error handling, logging  
✅ **Security** - Multi-tenancy, encryption, signature verification  
✅ **Performance** - Indexed queries, async operations  
✅ **Maintainability** - Modular services, clear separation of concerns
