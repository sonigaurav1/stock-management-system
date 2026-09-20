# Invento System Architecture

System design, data flow, component interactions, and security specifications for Invento.

---

## 1. High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             Next.js 16 Client                            │
│                 (React 19, TypeScript, Tailwind CSS, Shadcn)             │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     │ Real-time WebSocket / HTTPS
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                             Convex Backend Layer                         │
│                    (Real-Time Database + Server Functions)               │
│                                                                          │
│    ┌─────────────────┐      ┌─────────────────┐     ┌────────────────┐   │
│    │  Convex Queries │      │Convex Mutations │     │ Real-time Subs │   │
│    │  (Read Data)    │      │ (Write & State) │     │ (Live Pushes)  │   │
│    └────────┬────────┘      └────────┬────────┘     └───────┬────────┘   │
└─────────────┼────────────────────────┼──────────────────────┼────────────┘
              │                        │                      │
              ▼                        ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            Integrated Services                           │
│                                                                          │
│  ┌────────────────┐    ┌─────────────────┐    ┌───────────────────────┐  │
│  │ Clerk Auth     │    │ EdgeStore       │    │ SendGrid Email        │  │
│  │ (User Identity)│    │ (Image/PDF Storage)   │ (Transaction Alerts) │  │
│  └────────────────┘    └─────────────────┘    └───────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems & Responsibilities

### 1. Authentication & Data Scoping (`AUTH`)
- **Responsibility**: User identity verification and strict `userId` data scoping across all database queries.
- **Key Files**: `src/features/auth/`, `convex/admin.ts`, `convex/schema.ts`
- **Scoping Rule**: Every Convex query and mutation MUST filter using `q.eq("userId", userId)`. Clerk Organizations are NOT used.
- **Role Hierarchy**: `admin` (highest system & business admin role), `inventory_manager`, `billing_staff`, `accountant`. (Note: `super-admin` is replaced by `admin`).

### 2. Products Module (`PRODUCTS`)
- **Responsibility**: Item catalog, SKUs, barcodes, HSN/SAC codes, stock levels, stock status (`in_stock`, `low_stock`, `out_of_stock`), auto-reorder alerts, and soft deletions (`isDeleted: true`).
- **Key Files**: `convex/products.ts`, `convex/category.ts`, `src/app/(main)/dashboard/product/`

### 3. Suppliers Module (`SUPPLIERS`)
- **Responsibility**: Vendor directory, multi-supplier mapping (`productSuppliers`), MOQ, vendor SKUs, lead times, and vendor delivery ratings.
- **Key Files**: `convex/suppliers.ts`, `src/app/(main)/dashboard/product/supplier/`

### 4. Sales Module (`SALES`)
- **Responsibility**: Sales order checkout, real-time stock decrementing, revenue tracking, and `stockMovements` audit logging.
- **Key Files**: `convex/sales.ts`, `src/app/(main)/billing/`

### 5. Billing & Invoicing Module (`BILLING`)
- **Responsibility**: GST Tax Invoice generation (`jsPDF`), downloadable PDF invoices, recurring customer billing, and balance tracking.
- **Key Files**: `convex/invoices.ts`, `src/app/(main)/billing/`, `src/app/api/generate-pdf/`

### 6. Financial Ledger Module (`LEDGER`)
- **Responsibility**: Double-entry financial audit trail, customer receivables, supplier payables, and account balance reconciliation.
- **Key Files**: `convex/ledger.ts`, `src/app/(main)/ledger/`

### 7. Expenses Module (`EXPENSES`)
- **Responsibility**: Categorized expense tracking, EdgeStore receipt image attachments, category budget allocations, and expense approvals.
- **Key Files**: `convex/expenses.ts`, `src/app/(main)/expenses/`

### 8. Procurement Module (`PROCUREMENT`)
- **Responsibility**: Purchase order (PO) generation, supplier fulfillment tracking, vendor receiving, and inventory restock entries.
- **Key Files**: `convex/purchaseOrders.ts`, `src/app/(main)/procurement/`

### 9. Administration & RBAC Module (`ADMIN_RBAC`)
- **Responsibility**: User role management, RBAC permission setup, system monitoring, and immutable security audit logs (`auditLog`).
- **Key Files**: `convex/admin.ts`, `src/app/(developer-admin-page)/admin/`, `src/app/(main)/company-admin/`

---

## 3. Data Flow Patterns

### 3.1 Create Product Flow
```
1. User submits Product Form → `/dashboard/product`
2. Form triggers mutation `convex/products.ts:createProduct`
3. Backend validates authentication identity (`ctx.auth.getUserIdentity()`)
4. Mutation inserts record into `products` table with `userId` and `createdAt`
5. Convex real-time subscription pushes updated catalog to subscriber client components
```

### 3.2 Sales Order & Stock Movement Flow
```
1. Order submitted via Sales/Billing UI
2. Trigger `convex/sales.ts:createSale` mutation
3. Mutation updates:
   - `products`: Decrements `stockLevel` and recalculates `stockStatus`
   - `sales`: Inserts transaction order record
   - `stockMovements`: Inserts movement audit record (`quantityDelta: -N`, `type: 'sale'`)
   - `ledger`: Appends receivable financial record
4. Real-time Convex subscriptions update UI dashboard charts dynamically
```

---

## 4. Security & Data Isolation Architecture

- **Authentication**: Clerk handles identity verification and session tokens passed to Convex (`ctx.auth`).
- **User-Level Scoping**: Every database table includes a `userId` index. No unscoped queries are allowed.
- **Soft Deletion**: Records use `isDeleted: true` flags instead of hard database deletions to preserve accounting and tax audit histories.
- **Admin Access**: Restricted to `admin` role users.

---

## 5. Related Documentation Links
- **Master Sitemap**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
- **Database Schema**: [Documentation/reference/DATABASE_SCHEMA.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/DATABASE_SCHEMA.md)
- **Features Guides**: [Documentation/features/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/README.md)
