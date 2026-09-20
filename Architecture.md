# Invento - App Flow & System Architecture

> **Document Type**: Architecture & System Design Specification  
> **Target Audience**: AI Development Agents, Software Engineers, System Architects  
> **Project Name**: Invento (Inventory & Business Management System)  
> **Repository**: `sonigaurav1/stock-management-system`  

---

## 🧭 Documentation Sitemap Links
- **Master Documentation Index**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
- **Features Technical Guides**: [Documentation/features/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/README.md)
- **App Routes Index**: [Documentation/pages/APP_ROUTES.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/APP_ROUTES.md)
- **Database Schema**: [Documentation/reference/DATABASE_SCHEMA.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/DATABASE_SCHEMA.md)
- **AI Rules & Guardrails**: [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)

---

## 1. High-Level Architecture Overview

Invento uses a modern, real-time serverless architecture built with **Next.js 16 (App Router)** on the frontend and **Convex** on the backend, integrated with **Clerk** for user authentication and **EdgeStore** for file persistence.

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

### Key Architectural Directives for AI
1. **Real-time Reactivity**: Convex queries use WebSockets to push updates to the UI automatically. No manual polling (`setInterval`) or refetching (`refetch()`) is needed.
2. **User-Scoped Multi-Tenancy**: Data isolation is enforced strictly at the database level by `userId`. Clerk Organizations are NOT used. Every Convex query and mutation must index and filter by `userId`. (See [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md)).
3. **Role-Based Access Control (RBAC)**: User roles (`admin`, `inventory_manager`, `billing_staff`, `accountant`) govern access. Note that `super-admin` is replaced by `admin`. (See [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)).
4. **Soft Deletion**: Records (products, categories, suppliers) are marked `isDeleted: true` to ensure transactional audit trail integrity. (See [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)).

---

## 2. Tech Stack & Integration Matrix

| Layer / Concern | Technology | Purpose & Responsibility |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack) | Server & Client Components, routing, UI rendering. |
| **UI Library & Styling** | React 19, Tailwind CSS, Shadcn UI, Radix UI | Accessible, responsive, dark/light themed interface design (See [Design.md](file:///Users/gaurav/Desktop/Invento/Design.md)). |
| **State Management** | Convex React Hooks, React State, Zustand | Live sync with database queries (`useQuery`), local UI state. |
| **Backend & Realtime DB** | Convex (`convex/server`, `convex/values`) | Reactive database, serverless mutations, backend validation, indexing. |
| **User Authentication** | Clerk (`@clerk/nextjs`) | Identity verification, JWT session tokens passed to Convex context (`ctx.auth`). |
| **File & Asset Storage** | EdgeStore (`@edgestore/server`, `@edgestore/react`) | Storing product images, receipts, and invoice attachments. |
| **Email Communication** | SendGrid | Sending transactional notification emails and system alerts. |
| **Document Generation** | jsPDF, jsPDF-AutoTable | Client/server rendering of GST tax invoices, purchase orders, and ledger reports. |

---

## 3. Folder & File Structure

```
Invento/
├── convex/                          # Convex Backend Layer
│   ├── schema.ts                    # Single source of truth database schema
│   ├── products.ts                  # Product catalog queries & mutations
│   ├── category.ts                  # Category management
│   ├── suppliers.ts                 # Supplier directory & multi-supplier mapping
│   ├── sales.ts                     # Order processing & sales tracking
│   ├── invoices.ts                  # Tax invoices & recurring invoices
│   ├── ledger.ts                    # Double-entry ledger audit trail
│   ├── expenses.ts                  # Expense logging & approvals
│   ├── purchaseOrders.ts            # PO generation & vendor tracking
│   ├── inventoryReconciliations.ts # Physical inventory audit reconciliation
│   ├── admin.ts                     # System administration & RBAC management
│   └── _generated/                  # Auto-generated Convex API types
│
├── src/                             # Next.js Frontend Application
│   ├── app/                         # App Router directory (See Documentation/pages/APP_ROUTES.md)
│   │   ├── (auth)/                  # Sign-in, sign-up, email verification routes
│   │   ├── (main)/                  # Main authenticated application shell
│   │   │   ├── dashboard/           # Analytics, overview, product management
│   │   │   ├── billing/             # Invoice generation & customer payment view
│   │   │   ├── ledger/              # Financial ledger & balance entries
│   │   │   ├── expenses/            # Expense management & receipt viewer
│   │   │   ├── procurement/         # Purchase order creation & restock management
│   │   │   ├── inventory-audit/     # Physical stock audit & reconciliation
│   │   │   ├── inventory-forecast/  # Demand forecasting & reorder alerts
│   │   │   ├── company-admin/       # Business configuration & staff RBAC settings
│   │   │   ├── admin/               # System admin workspace
│   │   │   └── settings/            # Profile, security, notification preferences
│   │   └── api/                     # Next.js API routes (EdgeStore handler, PDF helpers)
│   │
│   ├── components/                  # UI Components
│   │   ├── ui/                      # Shadcn primitives (button, dialog, table, input)
│   │   ├── layout/                  # Navigation bar, sidebar, user button, providers
│   │   └── features/                # Feature-specific modals, forms, and tables
│   │
│   ├── features/                    # Feature state hooks and specialized domain logic
│   ├── lib/                         # Shared utilities, date formatters (Bikram Sambat), formatters
│   └── types/                       # Shared TypeScript definitions
│
├── Documentation/                   # System reference documentation & guides (See Documentation/README.md)
├── AI_INSTRUCTIONS.md                        # AI guidance and workflow instructions
└── Project Requirement Document.md  # Detailed functional & non-functional requirements
```

---

## 4. App Flow & Data Architecture Patterns

### 4.1 Authentication & Authorization Flow
```
User Access Request
   │
   ▼
Clerk Identity Provider  ──(JWT Token)──►  ConvexProviderWithClerk
                                                 │
                                                 ▼
                                     Convex Server Context (ctx.auth)
                                                 │
                                                 ▼
                                     Verify identity & extract userId
                                                 │
                                                 ▼
                                     Enforce RBAC role permissions
```

### 4.2 Stock Movement & Sales Flow
```
1. User records sale (Sales Page / POS)
   │
   ▼
2. Trigger `convex/sales.ts:createSale` mutation
   │
   ├─► Validates stock level in `products` table
   ├─► Decrements product stock quantity (`stockLevel`)
   ├─► Recalculates stock status ('in_stock' | 'low_stock' | 'out_of_stock')
   ├─► Inserts entry into `sales` table
   ├─► Appends audit log to `stockMovements` table
   └─► Appends financial transaction to `ledger` table
   │
   ▼
3. Convex automatically pushes live state updates to subscriber components
```

### 4.3 Procurement & Restock Flow
```
1. Product drops below reorder level (or manual PO creation)
   │
   ▼
2. Create Purchase Order (`convex/purchaseOrders.ts`)
   │
   ▼
3. Supplier receives PO & delivers goods
   │
   ▼
4. Receive Goods Mutation:
   ├─► Increments product `stockLevel`
   ├─► Updates supplier lead time performance metrics (`suppliers` table)
   └─► Records expenditure entry in `ledger` / `expenses` table
```

---

## 5. Database Schema & Indexing Strategy

All database schemas are defined in `convex/schema.ts`. Critical tables and indexing constraints include:

### Core Tables Summary

| Table | Scoping Field | Key Index | Feature Reference |
| :--- | :--- | :--- | :--- |
| `products` | `userId` | `by_user`, `by_user_and_isDeleted` | [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md) |
| `category` | `userId` | `by_user_and_isDeleted` | [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md) |
| `suppliers` | `userId` | `by_user_and_isDeleted`, `by_user_performance` | [SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md) |
| `productSuppliers` | `userId` | `by_user`, `by_product` | [SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md) |
| `sales` | `userId` | `by_user`, `by_user_and_date` | [SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md) |
| `invoices` | `userId` | `by_user`, `by_user_and_status` | [BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md) |
| `ledger` | `userId` | `by_user`, `by_user_and_type` | [LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md) |
| `expenses` | `userId` | `by_user`, `by_user_and_category` | [EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md) |
| `auditLog` | `userId` | `by_user` | [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md) |

---

## 6. Security & Performance Guidelines for AI Agents

1. **Zero Cross-User Leakage**:
   ```typescript
   // ✓ ALWAYS filter by userId
   const products = await ctx.db
     .query("products")
     .withIndex("by_user_and_isDeleted", (q) =>
       q.eq("userId", userId).eq("isDeleted", false)
     )
     .collect();

   // ✗ NEVER run unscoped queries
   const products = await ctx.db.query("products").collect();
   ```

2. **Mutation Guarding**:
   - Always call `const identity = await ctx.auth.getUserIdentity();` at the beginning of Convex backend mutations.
   - Reject unauthenticated calls immediately with `throw new Error("Unauthenticated");`.

3. **Soft Deletion Enforcement**:
   - Do not use `ctx.db.delete(id)` for primary business entities. Use `ctx.db.patch(id, { isDeleted: true, updatedAt: Date.now() })`.

4. **Component State Hygiene**:
   - Keep transient form state in React components using React Hook Form / Zod.
   - Save persistent state to Convex via mutations.