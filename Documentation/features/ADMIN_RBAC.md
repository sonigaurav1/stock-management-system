# System Administration & RBAC Feature Guide

> **Module**: `ADMIN_RBAC`  
> **Primary Responsibility**: System administration, user role management, permission overrides, and immutable audit logs.  
> **Note**: The `super-admin` role string is replaced by `admin`. `admin` is the top-level administrative role.

---

## 1. Executive Summary

The **ADMIN_RBAC** feature handles system-wide security, user permissions, role management, and audit log monitoring.

---

## 2. Role Hierarchy & Permission Matrix

| Role | System Scope & Rights |
| :--- | :--- |
| **Admin** | Full system and business administration, user role assignment, permission setup, security configuration, and audit log access (`/admin`, `/company-admin`). |
| **Inventory Manager** | Product creation/edits, SKU/barcode management, stock audits, reorder level adjustments, supplier sourcing, and stock movement logs. |
| **Sales & Billing Staff** | Creating sales orders, generating tax invoices, tracking customer balances, and viewing sales analytics. |
| **Finance / Accountant** | Ledger reconciliation, expense logging, budget approvals, financial reporting, and tax audits. |

---

## 3. Data Schema Summary (`auditLog`)

Defined in `convex/schema.ts`:

- `action`: Security action string (e.g. `USER_ROLE_CHANGED`, `PRODUCT_DELETED`, `BUSINESS_SETTINGS_UPDATED`).
- `performedBy`: User ID of actor.
- `details`: JSON payload string detailing exact changes.
- `timestamp`: Epoch timestamp.
- `userId`: Tenant scoping identifier.

---

## 4. Key Files & Components

- `convex/admin.ts`: Administrative functions, role assignment mutations, and system log queries.
- `src/app/(developer-admin-page)/admin/`: Developer & system admin workspace.
- `src/app/(main)/company-admin/`: Business administration & team RBAC settings UI.

---

## 5. Related Links
- **User Authentication**: [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md)
- **Project Rules**: [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)
