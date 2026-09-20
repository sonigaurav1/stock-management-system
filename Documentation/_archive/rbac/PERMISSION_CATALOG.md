# RBAC Permission Catalog

Complete reference of all permissions and role presets for Invento's RBAC system.

## Source of Truth

This document mirrors the permission definitions in:
- `convex/lib/permissions.ts` - Core permissions and role presets

---

## Permission List

### Inventory & Products

| Permission | Key | Description |
|------------|-----|-------------|
| View Inventory | `view_inventory` | Can see products, stock levels |
| Create Product | `create_product` | Can add new products |
| Edit Product | `edit_product` | Can modify product details |
| Delete Product | `delete_product` | Can remove products |
| Manage Stock | `manage_stock` | Can adjust stock levels |

### Transactions & Sales

| Permission | Key | Description |
|------------|-----|-------------|
| Create Transaction | `create_transaction` | Can create sales/purchases |
| Edit Transaction | `edit_transaction` | Can modify transactions |
| Delete Transaction | `delete_transaction` | Can remove transactions |
| Approve Transaction | `approve_transaction` | Can approve pending transactions |

### Reports & Export

| Permission | Key | Description |
|------------|-----|-------------|
| View Reports | `view_reports` | Can access reports |
| Export Data | `export_data` | Can export data to CSV/Excel |

### Finance & Ledger

| Permission | Key | Description |
|------------|-----|-------------|
| View Ledger | `view_ledger` | Can view financial ledger |
| Manage Expenses | `manage_expenses` | Can manage expense entries |
| View Financial Reports | `view_financial_reports` | Can see P&L, cash flow |

### Suppliers

| Permission | Key | Description |
|------------|-----|-------------|
| Manage Suppliers | `manage_suppliers` | Can manage supplier records |

### Users & Access Control

| Permission | Key | Description |
|------------|-----|-------------|
| Manage Users | `manage_users` | Can invite/remove team members |
| Manage Roles | `manage_roles` | Can create/edit custom roles |

### Settings

| Permission | Key | Description |
|------------|-----|-------------|
| Manage Settings | `manage_settings` | Can change organization settings |

### Organization & Company

| Permission | Key | Description |
|------------|-----|-------------|
| View Organization | `view_organization` | Can view organization details |
| Manage Organization | `manage_organization` | Can modify organization settings |

### Audit & Compliance

| Permission | Key | Description |
|------------|-----|-------------|
| View Audit Logs | `view_audit_logs` | Can view activity logs |
| View Compliance | `view_compliance` | Can access compliance reports |

---

## Role Presets

### Owner

Full access to all data and features.

```typescript
owner: [
  PERMISSIONS.VIEW_INVENTORY,
  PERMISSIONS.CREATE_PRODUCT,
  PERMISSIONS.EDIT_PRODUCT,
  PERMISSIONS.DELETE_PRODUCT,
  PERMISSIONS.MANAGE_STOCK,
  PERMISSIONS.CREATE_TRANSACTION,
  PERMISSIONS.EDIT_TRANSACTION,
  PERMISSIONS.DELETE_TRANSACTION,
  PERMISSIONS.APPROVE_TRANSACTION,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.EXPORT_DATA,
  PERMISSIONS.VIEW_LEDGER,
  PERMISSIONS.MANAGE_EXPENSES,
  PERMISSIONS.VIEW_FINANCIAL_REPORTS,
  PERMISSIONS.MANAGE_SUPPLIERS,
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.MANAGE_ROLES,
  PERMISSIONS.MANAGE_SETTINGS,
  PERMISSIONS.VIEW_ORGANIZATION,
  PERMISSIONS.MANAGE_ORGANIZATION,
  PERMISSIONS.VIEW_AUDIT_LOGS,
  PERMISSIONS.VIEW_COMPLIANCE,
]
```

### Manager

Elevated permissions for team leads.

```typescript
manager: [
  PERMISSIONS.VIEW_INVENTORY,
  PERMISSIONS.CREATE_PRODUCT,
  PERMISSIONS.EDIT_PRODUCT,
  PERMISSIONS.MANAGE_STOCK,
  PERMISSIONS.CREATE_TRANSACTION,
  PERMISSIONS.EDIT_TRANSACTION,
  PERMISSIONS.APPROVE_TRANSACTION,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.EXPORT_DATA,
  PERMISSIONS.VIEW_LEDGER,
  PERMISSIONS.MANAGE_EXPENSES,
  PERMISSIONS.VIEW_FINANCIAL_REPORTS,
  PERMISSIONS.MANAGE_SUPPLIERS,
  PERMISSIONS.VIEW_ORGANIZATION,
  PERMISSIONS.VIEW_AUDIT_LOGS,
]
```

### Staff

Limited permissions for sales staff.

```typescript
staff: [
  PERMISSIONS.VIEW_INVENTORY,
  PERMISSIONS.CREATE_TRANSACTION,
  PERMISSIONS.EDIT_TRANSACTION,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.VIEW_ORGANIZATION,
]
```

### Viewer

Read-only access.

```typescript
viewer: [
  PERMISSIONS.VIEW_INVENTORY,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.VIEW_ORGANIZATION,
]
```

---

## Permission Matrix

| Role | Inventory | Products | Transactions | Reports | Users | Settings | Org |
|------|-----------|----------|--------------|---------|-------|----------|-----|
| **Owner** | Full | Full | Full | Full | Full | Full | Full |
| **Manager** | View/Create/Edit | View/Create/Edit | Create/Edit/Approve | View/Export | - | - | View |
| **Staff** | View | - | Create/Edit | View | - | - | View |
| **Viewer** | View | - | - | View | - | - | - | View |

---

## Using Permissions in Code

### Importing Permissions

```typescript
import { PERMISSIONS } from './lib/permissions';
```

### Checking Permissions

```typescript
// Backend - in Convex queries/mutations
const caller = await resolveCallerContext(ctx);
requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
```

### Frontend Usage

```typescript
const { can, permissions } = useUserRole();

// Check single permission
if (can('create_product')) {
  <CreateButton />
}

// Check multiple permissions
if (canAny(['view_inventory', 'view_reports'])) {
  <Dashboard />
}
```

---

## Custom Roles

Create custom roles with specific permissions:

```typescript
// Example: Custom "Accounts Clerk" role
const accountsClerk = [
  PERMISSIONS.VIEW_INVENTORY,
  PERMISSIONS.CREATE_TRANSACTION,
  PERMISSIONS.EDIT_TRANSACTION,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.VIEW_LEDGER,
  PERMISSIONS.MANAGE_EXPENSES,
  PERMISSIONS.VIEW_FINANCIAL_REPORTS,
];
```

---

## Adding New Permissions

1. Add to `PERMISSIONS` object in `convex/lib/permissions.ts`
2. Add to role presets as needed
3. Use in queries/mutations

---

## Related Documents

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference
- [MIGRATION_EXAMPLES.md](./MIGRATION_EXAMPLES.md) - Migration examples
