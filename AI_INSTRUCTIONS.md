# Invento - AI Development Guidance & Operating System

Complete guide for AI assistants working on the Invento inventory management system.

---

## 🎯 Quick Start for Any AI Agent

When assigned any coding or documentation task on **Invento**, follow this order:

1. **Load Project Context**:
   - Read [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md) and [Documentation/INDEX.md](file:///Users/gaurav/Desktop/Invento/Documentation/INDEX.md).
   - Read [Documentation Governance Rules (RULES.md)](file:///Users/gaurav/Desktop/Invento/Documentation/RULES.md).
   - Read [Project Requirement Document.md](file:///Users/gaurav/Desktop/Invento/Project%20Requirement%20Document.md) and [Memory.md](file:///Users/gaurav/Desktop/Invento/Memory.md).
2. **Understand Architecture & Rules**:
   - Read [Architecture.md](file:///Users/gaurav/Desktop/Invento/Architecture.md) and [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md).
   - Check the specific feature guide under [Documentation/features/](file:///Users/gaurav/Desktop/Invento/Documentation/features/README.md).
3. **Verify Constraints**:
   - **User Data Isolation (`userId`)**: All queries/mutations filter by `userId`. Clerk Organizations are NOT used. (See [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md)).
   - **Role Governance**: Top administrative role is `admin` (`super-admin` is removed). (See [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)).
   - **Soft Deletion (`isDeleted`)**: Never hard-delete products, suppliers, or invoices.
   - **Removed Features**: Payments/subscriptions removed; Twilio & Slack removed (SendGrid email only).
4. **Implement**: Code following established patterns in [CODE-PATTERNS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CODE-PATTERNS.md).
5. **Verify**: Run `pnpm run build` or `pnpm run lint` to ensure zero compilation errors.

---

## 📊 Project Tech Stack Overview

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI, Radix UI (See [Design.md](file:///Users/gaurav/Desktop/Invento/Design.md)).
- **Backend & DB**: Convex (Real-time Database + Server Functions).
- **Authentication**: Clerk (User identity, session management; data scoped per `userId`).
- **File Storage**: EdgeStore (Product images, receipts, PDF attachments).
- **Notifications**: SendGrid (Transactional emails).
- **Document Engine**: jsPDF, jsPDF-AutoTable (GST Tax Invoices & Reports).

---

## 📚 Central Documentation Directory Sitemap

- ⚖️ **[Documentation Rules (RULES.md)](file:///Users/gaurav/Desktop/Invento/Documentation/RULES.md)** — Mandatory standards for managing and updating documentation files.

### Feature Technical Guides (`Documentation/features/`)
- 🔐 **[AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md)** - User identity & `userId` database isolation.
- 📦 **[PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)** - Product catalog, SKUs, barcodes, stock tracking, and auto-reorder alerts.
- 🚚 **[SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md)** - Supplier directory, multi-supplier mapping (`productSuppliers`), and vendor lead times.
- 🛒 **[SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md)** - Order creation, inventory decrementing, and `stockMovements` audit log.
- 📄 **[BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md)** - GST Tax Invoicing, downloadable PDF invoices, and recurring customer billing.
- 📒 **[LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md)** - Double-entry financial audit trail, customer receivables, and supplier payables.
- 💵 **[EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md)** - Expense tracking, EdgeStore receipts, and category budgets.
- 📦 **[PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md)** - Purchase Orders (POs), restock mutations, and supplier receiving.
- 🔍 **[INVENTORY_AUDIT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/INVENTORY_AUDIT.md)** - Physical stock count audits and discrepancy reconciliation.
- 🛡️ **[ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)** - System administration, role hierarchy (`admin` role top-level), and security audit logs.

### App Pages & Routes (`Documentation/pages/`)
- 🗺️ **[APP_ROUTES.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/APP_ROUTES.md)** - Complete route map of all 75+ Next.js 16 App Router pages.
- ⚡ **[PAGE_CONTEXT.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/PAGE_CONTEXT.md)** - Page context map linking routes to UI components and Convex hooks.

### Core System References (`Documentation/reference/`)
- 📐 **[ARCHITECTURE.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/ARCHITECTURE.md)** - System design & data flow.
- 🗄️ **[DATABASE_SCHEMA.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/DATABASE_SCHEMA.md)** - Convex database schema overview.
- 🧩 **[CODE_PATTERNS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CODE-PATTERNS.md)** - Component & Convex mutation patterns.
- 📏 **[CONVENTIONS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CONVENTIONS.md)** - Code style & naming conventions.
- ⚡ **[API_GUIDE.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/API-GUIDE.md)** - Convex API patterns & security rules.

---

## 🎨 Key Code Conventions

```typescript
// 1. Convex Queries & Mutations MUST filter by userId
export const getMyProducts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db
      .query("products")
      .withIndex("by_user_and_isDeleted", (q) =>
        q.eq("userId", identity.subject).eq("isDeleted", false)
      )
      .collect();
  },
});

// 2. Soft Delete Pattern (Never ctx.db.delete)
await ctx.db.patch(productId, { isDeleted: true, updatedAt: Date.now() });

// 3. User Feedback & Error Toasts
try {
  await createProduct(data);
  toast.success("Product created!");
} catch (error) {
  toast.error("Failed to create product");
  console.error("Context:", error);
}
```

---

## 🎯 Verification Criteria Before Ending Turn

- [ ] Code strictly enforces `userId` data scoping across Convex queries.
- [ ] No `any` types in TypeScript.
- [ ] `super-admin` role string is NOT used (`admin` is top-level).
- [ ] Code compiles cleanly with `pnpm run build` or `pnpm run lint`.
- [ ] Documentation updated if introducing new patterns or schemas per [Documentation/RULES.md](file:///Users/gaurav/Desktop/Invento/Documentation/RULES.md).
