# Role-Based Access Control (RBAC) Architecture & Specification

> **Document Type**: Core Technical Reference  
> **Module Reference**: `ADMIN_RBAC`  
> **Source of Truth**: `convex/lib/permissions.ts` & `convex/admin.ts`  
> **Note**: The `super-admin` role is replaced by `admin`. `admin` is the top-level administrative role.

---

## 1. Executive Summary

Invento uses a granular Role-Based Access Control (RBAC) system to govern user access across Next.js UI routes and Convex backend mutations. Access controls are calculated per user based on assigned system roles (`admin`, `inventory_manager`, `billing_staff`, `accountant`) and optional granular permission overrides.

---

## 2. System Role Hierarchy

| Role | Role Key | Target Persona & System Rights |
| :--- | :--- | :--- |
| **Admin** | `admin` | Top-level system and business administrator. Full access to system settings, team management, RBAC permission setup, audit logs, and business configuration (`/admin`, `/company-admin`). |
| **Inventory Manager** | `inventory_manager` | Catalog management, SKU & barcode creation, stock audits, reorder level adjustments, supplier sourcing, and stock movement logs. |
| **Sales & Billing Staff** | `billing_staff` | Sales order processing, tax invoice generation, customer balance tracking, and sales reports viewing. |
| **Finance / Accountant** | `accountant` | Double-entry financial ledger reconciliation, expense entry, budget approvals, financial reporting, and tax compliance audits. |

---

## 3. Permission Catalog

Permissions are explicitly named strings defined in `convex/lib/permissions.ts`:

### Inventory & Catalog
- `view_inventory` - View products, categories, and stock levels.
- `create_product` - Add new products to catalog.
- `edit_product` - Edit product details and prices.
- `delete_product` - Soft delete products (`isDeleted: true`).
- `manage_stock` - Perform physical stock count adjustments and reconciliations.

### Sales & Invoicing
- `create_transaction` - Record sales transactions.
- `edit_transaction` - Modify pending sales or invoices.
- `delete_transaction` - Cancel transactions.
- `approve_transaction` - Approve sales or PO fulfillments.

### Finance & Expenses
- `view_ledger` - View double-entry financial audit trail.
- `manage_expenses` - Create expense logs and upload EdgeStore receipt assets.
- `view_financial_reports` - Access balance sheets, P&L reports, and tax reports.

### Suppliers & Procurement
- `manage_suppliers` - Create and edit supplier profiles and multi-supplier mapping.
- `create_po` - Create and issue purchase orders to vendors.

### Administration & Security
- `manage_users` - Invite and manage team members.
- `manage_roles` - Assign roles and custom permission overrides.
- `view_audit_logs` - Access immutable security audit logs (`auditLog`).

---

## 4. Code Implementation Patterns

### 4.1 Backend Convex Mutation Guard
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkUserPermission } from "./lib/permissions";

export const updateBusinessSettings = mutation({
  args: { settings: v.any() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Verify admin / permission rights
    const hasAccess = await checkUserPermission(ctx, identity.subject, "manage_settings");
    if (!hasAccess) {
      throw new Error("Access Denied: Insufficient RBAC permissions");
    }

    // Proceed with mutation...
  },
});
```

### 4.2 Frontend Route & Component Guard
```typescript
"use client";

import { useUserRole } from "@/features/auth/hooks/useUserRole";

export function AdminOnlyControl() {
  const { role, isLoading } = useUserRole();

  if (isLoading) return null;
  if (role !== "admin") return null;

  return <Button>System Configuration</Button>;
}
```

---

## 5. Related Links
- **Admin & RBAC Feature Guide**: [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)
- **User Authentication & Data Isolation**: [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md)
- **Project Rules**: [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)
