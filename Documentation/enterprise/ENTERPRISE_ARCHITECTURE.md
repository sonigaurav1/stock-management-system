# Enterprise System Architecture

**Technical Overview & System Design**

This document outlines the enterprise-grade architecture designed to scale to thousands of users, handle millions of transactions, and provide real-time analytics.

---

## System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │  Web App    │  │  Mobile App │  │  API Client │               │
│  │  (React)    │  │  (React)    │  │  (3rd-party)│               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │
└─────────┼─────────────────┼─────────────────┼──────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
┌─────────────────────────────┼──────────────────────────────────────┐
│              PRESENTATION LAYER (Next.js App Router)               │
│  ├─ Server Components (SSR)                                        │
│  ├─ Client Components (Interactivity)                              │
│  ├─ API Routes                                                      │
│  └─ Middleware (Auth, CORS, Logging)                               │
└─────────────────────────────┼──────────────────────────────────────┘
                            │
┌─────────────────────────────┼──────────────────────────────────────┐
│           BUSINESS LOGIC LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Dashboard  │  │   Reports    │  │   Analytics  │             │
│  │   Engine     │  │   Engine     │  │   Engine     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Forecast   │  │   Workflow   │  │   Rules      │             │
│  │   Engine     │  │   Engine     │  │   Engine     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────┼──────────────────────────────────────┘
                            │
┌─────────────────────────────┼──────────────────────────────────────┐
│         CONVEX BACKEND (Real-time Database + Functions)            │
│  ├─ Authentication & Authorization                                 │
│  ├─ Database Operations                                            │
│  ├─ Business Logic Functions                                       │
│  ├─ Real-time Subscriptions                                        │
│  ├─ File Storage                                                    │
│  └─ Scheduled Jobs                                                 │
└─────────────────────────────┼──────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────┴─────┐  ┌──────────┴────────┐  ┌──────┴────────┐
│  DATABASE   │  │  CACHE LAYER     │  │ FILE STORAGE  │
│  Indexed    │  │  (Redis/Convex)  │  │ (S3/Convex)   │
│  Relational │  │  Sub-second      │  │ Documents     │
│  Schema     │  │  responses       │  │ Images        │
└─────────────┘  └──────────────────┘  └───────────────┘

        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────┴──────────┐  ┌─────┴──────┐  ┌──────┴────────┐
│  EXTERNAL APIs   │  │  WEBHOOKS  │  │  QUEUE        │
│  • Payments      │  │  Outgoing  │  │  • Background │
│  • Email/SMS     │  │  Events    │  │    Jobs       │
│  • Integrations  │  │  Tracking  │  │  • Analytics  │
└──────────────────┘  └────────────┘  └───────────────┘
```

---

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Charts**: Recharts
- **Real-time**: Convex React hooks

### Backend

- **Runtime**: Node.js (via Convex)
- **Database**: Convex (Real-time, queryable)
- **Authentication**: Clerk (OAuth, Email, Phone)
- **File Storage**: Convex + AWS S3
- **Webhooks**: Convex webhooks
- **Jobs**: Convex scheduled functions

### External Services

- **Payments**: Razorpay
- **Email**: SendGrid
- **SMS**: Twilio
- **Notifications**: Slack, Telegram
- **Integrations**: Shopify, WooCommerce, Tally, QuickBooks

### Deployment

- **Frontend**: Vercel
- **Backend**: Convex Cloud
- **Database**: Convex Database (auto-replicated)
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry, LogRocket

---

## Data Model (Core Entities)

### Products

```
- id: string (unique)
- name: string
- sku: string (unique)
- barcode: string
- category: string
- description: string
- costPrice: number
- sellingPrice: number
- currentStock: number
- tags: string[]
- images: string[]
- supplier: string (reference)
- createdAt: timestamp
- updatedAt: timestamp
- deletedAt: timestamp (soft delete)
```

### Sales & Transactions

```
- id: string
- date: timestamp
- productId: string (reference)
- quantity: number
- unitPrice: number
- totalAmount: number
- customerId: string (reference)
- paymentMethod: enum
- status: enum (pending, completed, cancelled)
- notes: string
- createdBy: string (user)
- createdAt: timestamp
```

### Customers

```
- id: string
- name: string
- email: string
- phone: string
- type: enum (retail, wholesale, individual)
- totalPurchases: number
- lifetimeValue: number
- lastPurchaseDate: timestamp
- address: object
- tags: string[]
```

### Suppliers

```
- id: string
- name: string
- email: string
- phone: string
- address: object
- products: string[] (referenced products)
- leadTime: number (days)
- paymentTerms: string
- rating: number (0-5)
```

### Inventory Movements

```
- id: string
- type: enum (purchase, sale, damage, return, adjustment)
- productId: string
- quantity: number
- reason: string
- reference: string (PO number, Invoice, etc.)
- createdBy: string
- createdAt: timestamp
```

### Financial Records

```
- id: string
- type: enum (income, expense)
- category: string
- amount: number
- date: timestamp
- description: string
- attachment: string (file)
- status: enum (draft, approved, posted)
```

---

## API Design

### REST API Structure

```
/api/
├── /products
│   ├── GET /          (list with filters, pagination)
│   ├── GET /:id       (get single)
│   ├── POST /         (create)
│   ├── PATCH /:id     (update)
│   └── DELETE /:id    (soft delete)
│
├── /sales
│   ├── GET /          (list, filterable by date/customer)
│   ├── POST /         (create sale transaction)
│   └── GET /analytics (sales analytics)
│
├── /inventory
│   ├── GET /          (current stock levels)
│   ├── POST /movement (log movement)
│   └── GET /forecast  (reorder recommendations)
│
├── /customers
│   ├── GET /          (list)
│   ├── GET /:id       (customer details)
│   ├── GET /:id/history (purchase history)
│   └── GET /:id/lifetime-value (LTV calculation)
│
├── /suppliers
│   ├── GET /          (list)
│   ├── GET /:id       (supplier details)
│   └── GET /:id/performance (quality metrics)
│
├── /reports
│   ├── GET /p-and-l   (P&L report)
│   ├── GET /cash-flow (Cash flow forecast)
│   ├── GET /sales     (Sales report)
│   └── GET /inventory (Inventory report)
│
├── /analytics
│   ├── GET /dashboard (dashboard metrics)
│   ├── GET /insights  (AI insights)
│   └── GET /trends    (trend analysis)
│
├── /auth
│   ├── POST /login    (via Clerk)
│   ├── POST /logout   (via Clerk)
│   └── GET /me        (current user)
│
└── /integrations
    ├── GET /          (list connected integrations)
    ├── POST /:type/connect (connect new integration)
    └── DELETE /:type  (disconnect)
```

---

## Authentication & Authorization

### Authentication Flow

1. User signs up/logs in via Clerk
2. Clerk generates JWT token
3. Token sent with each request in Authorization header
4. Convex verifies token and extracts user identity
5. User context available throughout request

### Authorization Levels

| Role           | Permissions                                             |
| -------------- | ------------------------------------------------------- |
| **Admin**      | All access, user management, system settings            |
| **Manager**    | View all reports, approve transactions, team management |
| **Finance**    | View P&L, reports, reconciliation, cannot edit sales    |
| **Operations** | Manage inventory, create sales, view analytics          |
| **Staff**      | Create sales, record inventory only                     |
| **Viewer**     | View-only access to dashboard and reports               |

### Row-Level Security

- Each user sees only data from their organization
- Multi-organization support via organization ID filtering
- Audit trail logs all access and modifications

---

## Real-time Features

### Convex Real-time Subscriptions

**Dashboard Updates**

```typescript
// Dashboard metrics update in real-time
- Sales counter increases as new sales happen
- Inventory levels drop/increase immediately
- Stock alerts fire instantly
- Forecast updates as new data comes in
```

**Notifications**

```typescript
// Real-time notifications to users
- Low stock alerts
- Payment due reminders
- Large sale notifications (above threshold)
- Approval requests
```

**Collaboration**

```typescript
// Team member activities visible in real-time
- User editing same record sees changes
- Live activity feed
- Comment notifications
```

---

## Performance & Scalability

### Database Optimization

- **Indexes**: Created on frequently queried fields
  - productId, customerId, date fields
  - Organization filters
  - Status enums
- **Query Patterns**: Optimized for common queries
  - Sales by date range
  - Inventory by product/category
  - Customer purchase history

### Caching Strategy

- **Dashboard Data**: Cache for 30 seconds
- **Reports**: Cache for 1 hour (user can refresh)
- **Reference Data**: Cache indefinitely (products, categories)
- **User Data**: Cache for request duration

### Pagination

- Default: 20 items per page
- Max: 1000 items per page
- Cursor-based pagination for large datasets
- Pre-calculate aggregates to avoid scanning

### Load Distribution

- Frontend: Vercel Edge Network (100+ regions)
- Backend: Convex auto-scales (serverless)
- Database: Auto-replicas for read scaling
- Static assets: CDN with 1-year cache

**Expected Scale**:

- 10,000+ concurrent users
- 1 million+ transactions/day
- Response time <500ms for 99% of queries
- Dashboard updates every 30 seconds

---

## Security

### Data Protection

- ✅ Encryption in transit (HTTPS/TLS 1.3)
- ✅ Encryption at rest (AES-256)
- ✅ End-to-end encryption for sensitive data
- ✅ Regular security audits (quarterly)
- ✅ Penetration testing (annually)

### Access Control

- ✅ Role-based access control (RBAC)
- ✅ Organization-level data isolation
- ✅ Audit trail for all actions
- ✅ Two-factor authentication (2FA) support
- ✅ Session management with 1-hour timeout

### Compliance

- ✅ GDPR compliant (EU user data)
- ✅ CCPA compliant (California user data)
- ✅ ISO 27001 ready (data security)
- ✅ SOC 2 ready (system compliance)
- ✅ Tax compliance (local regulations)

### Monitoring

- ✅ Real-time error tracking (Sentry)
- ✅ Performance monitoring (APM)
- ✅ Security event logging
- ✅ Intrusion detection
- ✅ Automated backups (daily)

---

## Integrations Architecture

### Integration Patterns

**Incoming Integrations** (Third-party → Our System)

```
E-commerce Platform (Shopify/WooCommerce)
        ↓
    Webhook Handler
        ↓
    Data Transformation
        ↓
    Convex Database
        ↓
    User Notifications
```

**Outgoing Integrations** (Our System → Third-party)

```
User Action (Create Invoice)
        ↓
    Convex Function
        ↓
    External API Call (Tally/QB)
        ↓
    Webhook to notify completion
        ↓
    User Notification
```

### Supported Integrations

| Category      | Service     | Status  | Features                             |
| ------------- | ----------- | ------- | ------------------------------------ |
| E-commerce    | Shopify     | ✅ Live | Sync products, orders, inventory     |
| E-commerce    | WooCommerce | ⏳ Q1   | Sync products, orders, inventory     |
| E-commerce    | Amazon      | ⏳ Q2   | Sync orders, fulfillment             |
| Accounting    | Tally       | ✅ Live | Export invoices, GL entries          |
| Accounting    | QuickBooks  | ✅ Live | Sync transactions, customers         |
| Accounting    | XERO        | ⏳ Q1   | Sync transactions, GL                |
| Payment       | Razorpay    | ✅ Live | Payment verification, refunds        |
| Payment       | Stripe      | ⏳ Q2   | Payment processing                   |
| CRM           | HubSpot     | ⏳ Q2   | Customer sync, deal integration      |
| Communication | Slack       | ✅ Live | Notifications, alerts                |
| Communication | SMS         | ✅ Live | Twilio SMS alerts                    |
| BI Tools      | Power BI    | ⏳ Q3   | Direct connectivity, live dashboards |
| BI Tools      | Tableau     | ⏳ Q3   | API data source                      |

---

## Deployment Architecture

### Development Environment

- Local development with Convex CLI
- Hot reload for frontend changes
- Mock data for testing
- Sentry in dev mode (disabled)

### Staging Environment

- Vercel preview deployment (per branch)
- Staging Convex database
- Data refresh from production (weekly)
- Full testing before production

### Production Environment

```
┌─────────────────────────────────────────┐
│  Vercel (Edge Functions)              │
│  ├─ Web App (Next.js)                │
│  ├─ API Routes                        │
│  └─ Middleware                        │
└────────────┬────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│  Convex Cloud (Backend)                │
│  ├─ Database (Auto-replicated)         │
│  ├─ Functions (Auto-scaled)            │
│  ├─ File Storage                       │
│  └─ Webhooks                           │
└────────────┬────────────────────────────┘
             │
┌────────────┴────────────────────────────┐
│  External Services                      │
│  ├─ Clerk (Auth)                       │
│  ├─ SendGrid (Email)                   │
│  ├─ Razorpay (Payments)                │
│  └─ Integration Partners               │
└─────────────────────────────────────────┘

Monitoring: Sentry, LogRocket, Datadog
Backup: Daily to S3, retained for 30 days
DNS: Cloudflare (DDoS protection, caching)
```

---

## Monitoring & Analytics

### System Health Metrics

- **Uptime**: Target 99.9%
- **Response Time**: P95 < 500ms, P99 < 2s
- **Error Rate**: < 0.1% of requests
- **Database Latency**: < 50ms P95

### Business Metrics

- **Daily Active Users**: Track engagement
- **Feature Adoption**: % users using each feature
- **CSAT**: Customer satisfaction surveys
- **Churn Rate**: Organization churn
- **NPS**: Net promoter score

### Operational Metrics

- **Build Time**: < 5 minutes
- **Deployment Frequency**: 2-5 deployments/day
- **MTTR**: < 15 minutes (mean time to recover)
- **Test Coverage**: > 80% of critical paths

---

## Disaster Recovery

### Backup Strategy

- **Database**: Continuous replication to 3 regions
- **Daily Snapshots**: Retained for 30 days
- **RPO** (Recovery Point Objective): 5 minutes
- **RTO** (Recovery Time Objective): 15 minutes

### Failover Procedure

1. Automated detection of region failure
2. Automatic failover to backup region
3. User sessions resume transparently
4. Notification to ops team
5. Investigation and potential action

### Data Retention

- **Active Data**: Kept indefinitely with backups
- **Deleted Data**: Soft-deleted (recovery possible for 30 days)
- **Audit Logs**: Retained for 7 years (compliance)
- **Backups**: Retained for 30 days minimum

---

## Cost Optimization

### Infrastructure Costs

- **Vercel**: ~$100-500/month (scales with usage)
- **Convex**: ~$200-1000/month (scales with storage and functions)
- **Third-party APIs**: Variable (~$100-500/month)
- **Monitoring**: ~$100-300/month

### Cost Optimization Strategies

- ✅ Database sharding by organization
- ✅ Caching to reduce compute
- ✅ Batch processing for reports
- ✅ Reserved capacity discounts
- ✅ Automatic scaling (no over-provisioning)

---

## Future Architecture Enhancements

### Phase 1 (Q2 2024)

- [ ] GraphQL API (alternative to REST)
- [ ] Redis caching layer for hot data
- [ ] PDF generation service (async)
- [ ] Notification queue system

### Phase 2 (Q3 2024)

- [ ] ML/AI inference service
- [ ] Data warehouse for analytics
- [ ] Real-time collaboration features
- [ ] Advanced audit logging

### Phase 3 (Q4 2024)

- [ ] Multi-region deployment
- [ ] Data sovereignty options
- [ ] Advanced encryption options
- [ ] Custom SLA support

---

## Developer Guidelines

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint + Prettier for code style
- Unit tests for business logic (80%+ coverage)
- Integration tests for API endpoints
- E2E tests for critical user flows

### Git Workflow

- Feature branches from `develop`
- Pull requests require 1 approval
- Automated tests must pass
- Merge to `main` for production releases

### Documentation

- API endpoints documented with examples
- Complex functions have inline comments
- README for each major module
- Architecture decisions in ADRs (Architecture Decision Records)
