# Invento Architecture

System design, data flow, and component interactions.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js Frontend                        │
│  (React 19 + TypeScript + Tailwind CSS + shadcn/ui)     │
└─────────────┬───────────────────────────────────────────┘
              │
              │ REST/WebSocket
              │
┌─────────────▼───────────────────────────────────────────┐
│              Convex Backend                              │
│   (Real-time Database + API Layer)                       │
│  ├─ Queries (read operations)                            │
│  ├─ Mutations (write operations)                         │
│  └─ Real-time Subscriptions                              │
└─────────────┬───────────────────────────────────────────┘
              │
    ┌─────────┼──────────┬──────────┬────────────┐
    │         │          │          │            │
    ▼         ▼          ▼          ▼            ▼
┌────────┐ ┌─────────┐ ┌───────┐ ┌──────────┐ ┌──────────┐
│ Clerk  │ │Razorpay │ │EdgeSt │ │SendGrid/ │ │Analytics │
│ Auth   │ │Payments │ │ ore   │ │ Slack    │ │          │
└────────┘ └─────────┘ └───────┘ └──────────┘ └──────────┘
```

## Core Modules

### 1. Authentication (Clerk)
- **Responsibility**: User identity, organizations, roles
- **Key Files**: `src/features/auth/`, convex/admin.ts
- **Provider**: `ConvexProvider` wraps app with auth context
- **Flow**: Clerk sign-in → Organization creation → Convex session

### 2. Products Module
- **Responsibility**: Product catalog, inventory tracking
- **Key Files**: `convex/products.ts`, `src/app/.../dashboard/product/`
- **Operations**: Create, read, update, delete, search
- **Related**: Suppliers (source), Sales (consumption), Ledger (audit)

### 3. Suppliers Module
- **Responsibility**: Vendor/supplier management
- **Key Files**: `convex/suppliers.ts`, `src/app/.../dashboard/product/supplier/`
- **Operations**: Supplier profiles, stock management
- **Related**: Products (supplied items), Purchase orders

### 4. Sales Module
- **Responsibility**: Sales orders, customer transactions
- **Key Files**: `convex/sales.ts`, `src/app/.../restock/` (confusing name, actually sales)
- **Operations**: Create orders, track sales, generate invoices
- **Related**: Products (items sold), Ledger (financial record)

### 5. Ledger Module
- **Responsibility**: Financial record-keeping, audit trail
- **Key Files**: `convex/ledger.ts`, `src/app/.../ledger/`
- **Operations**: Record transactions, balance tracking
- **Related**: Products (adds/removes), Sales (revenue), Billing (payments)

### 6. Billing Module
- **Responsibility**: Payment processing, subscription management
- **Key Files**: `convex/billing.ts`, `src/app/.../billing/`
- **Operations**: Invoice generation, Razorpay payments, subscription plans
- **Related**: Sales (order payments), Ledger (financial tracking)

### 7. Organizations Module
- **Responsibility**: Multi-tenant support, company settings
- **Key Files**: `convex/organizations.ts`, company-details setup
- **Operations**: Create org, manage settings, user invitations
- **Related**: Auth (user roles), all modules (org isolation)

### 8. Admin Module
- **Responsibility**: System administration, developer controls
- **Key Files**: `convex/admin.ts`, `src/app/(developer-admin-page)/admin/`
- **Operations**: User management, system monitoring, data inspection
- **Access**: Restricted to admin role

## Data Flow Patterns

### Create Product Flow
```
1. User fills form → Product Page
2. Form submission → products.ts mutation
3. Mutation validates + creates in Convex
4. Real-time subscription updates inventory
5. Ledger auto-records inventory change
6. UI updates with new product
```

### Record Sale Flow
```
1. User creates order → Sales Page
2. Sales mutation in sales.ts
3. Mutation updates:
   - Products (decrease stock)
   - Sales table (record)
   - Ledger (financial entry)
4. Subscriptions notify dashboard
5. Billing checks if invoice needed
```

### Query Optimization
- Use Convex indexes on frequently searched fields
- Paginate large lists (products, sales history)
- Cache user organization data in provider context
- Use real-time subscriptions for dashboard updates

## File Organization

```
convex/
├── schema.ts               # Database schema definitions
├── products.ts             # Product queries & mutations
├── suppliers.ts            # Supplier management
├── sales.ts                # Sales operations
├── ledger.ts               # Financial tracking
├── billing.ts              # Payment & subscription
├── organizations.ts        # Multi-tenant setup
├── admin.ts                # Admin functions
├── verification.ts         # Email verification, etc
└── _generated/api.d.ts     # Auto-generated types

src/
├── app/
│   ├── (auth)/             # Auth flow (sign-up, verify)
│   ├── (main)/             # Main authenticated app
│   │   └── (authenticated)/
│   │       ├── dashboard/  # Main dashboard
│   │       ├── ledger/     # Financial ledger
│   │       ├── restock/    # Sales (confusing name)
│   │       ├── billing/    # Billing UI
│   │       └── settings/   # Account settings
│   ├── (developer-admin-page)/ # Admin panel
│   ├── (marketing)/        # Public pages
│   └── api/                # External APIs (edgestore)
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, sidebar, providers
│   └── ...                 # Feature components
│
├── features/
│   └── auth/               # Auth logic, hooks
│
└── lib/
    └── utils.ts            # Helper functions
```

## Database Design Considerations

- **Convex Documents**: Each module manages its own collection
- **Relationships**: Tracked via document IDs (like foreign keys)
- **Timestamps**: Use Date objects for tracking
- **Organization Isolation**: Every query filters by org context
- **Audit Trail**: Ledger records all significant changes

## Performance Considerations

1. **Real-time Subscriptions**: Use sparingly, only for dashboards
2. **Pagination**: Essential for lists > 100 items
3. **Indexing**: Create indexes on frequently queried fields
4. **Caching**: Use React Context for org/user data
5. **Batch Operations**: Group mutations when possible

## Security Model

- **Authentication**: Clerk handles user identity
- **Authorization**: Organization context validates access
- **Data Isolation**: All queries filtered by organization
- **Admin Access**: Special admin role for system operations
- **API Keys**: Stored in env variables, never exposed to frontend
