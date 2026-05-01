# RBAC Documentation

Role-Based Access Control (RBAC) system implementation and reference for Invento.

## Overview

Invento's RBAC system allows business owners to invite staff members with limited permissions within their organization. It provides granular access control through a permission-based system with preset and custom roles.

## Documentation Index

| Document | Description |
|----------|-------------|
| [PERMISSION_CATALOG.md](./PERMISSION_CATALOG.md) | Complete reference of all permissions and role presets |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Step-by-step implementation guide |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick reference and FAQ |
| [MIGRATION_EXAMPLES.md](./MIGRATION_EXAMPLES.md) | Code migration examples |

## Quick Links

### For Developers
- **Permission Catalog**: See [PERMISSION_CATALOG.md](./PERMISSION_CATALOG.md)
- **Implementation**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Migration**: See [MIGRATION_EXAMPLES.md](./MIGRATION_EXAMPLES.md)

### For Users
- **Quick Start**: See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **FAQ**: See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-quick-questions)

## Key Concepts

### Permission System
- **Permissions**: Individual access rights (e.g., `view_inventory`, `create_product`)
- **Roles**: Collections of permissions (e.g., `owner`, `manager`, `staff`, `viewer`)
- **Custom Roles**: User-defined roles with custom permission sets

### Data Scope
- **Owner**: Full access to their organization's data
- **Staff**: Access limited to what owner permits, view-owner's data
- **Caller ID vs Owner ID**: Always use owner ID for data queries

## Core Files

| File | Purpose |
|------|---------|
| `convex/lib/permissions.ts` | Permission strings and role presets |
| `convex/lib/authHelper.ts` | Core auth functions |
| `convex/companyAccess.ts` | Invitation and member management |
| `src/hooks/useUserRole.ts` | Frontend permission hook |

## Architecture

```
User Login (Clerk)
    ↓
resolveCallerContext()
    ↓
Returns MemberContext:
├── callerId (who is logged in)
├── ownerId (whose data to access)
├── permissions (what they can do)
└── role (their role)
    ↓
Database Query filter by ownerId
```

## Next Steps

1. **New to RBAC**: Start with [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
2. **Quick Reference**: See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. **Permission Details**: See [PERMISSION_CATALOG.md](./PERMISSION_CATALOG.md)

## Related Documentation

- [Documentation/enterprise/ENTERPRISE_ARCHITECTURE.md](../enterprise/ENTERPRISE_ARCHITECTURE.md) - Enterprise architecture
- [Documentation/overview/ADMIN.md](../overview/ADMIN.md) - Admin dashboard features
