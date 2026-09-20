# User Types Overview

## 3 User Roles

| User Type        | Access URL            | Purpose                                                                                           | Who                                                                    |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Regular User** | `/dashboard/overview` | Business operations dashboard with analytics, inventory, sales, finance, forecasting              | Any authenticated user with approved account status                    |
| **Admin**        | `/admin`              | Company-level management dashboard for team, audit logs, feedback, reports, compliance            | Specific company admin(s) configured in `NEXT_PUBLIC_ADMIN_USER_ID`    |
| **Super Admin**  | `/super-admin`        | Platform-wide oversight: companies, monitoring, feedback, system settings, **account management** | System administrators configured in `NEXT_PUBLIC_SUPER_ADMIN_USER_IDS` |

## Sign-Up Workflow

### For Business Owners

```
1. Sign Up (Clerk)
   ↓
2. Email Verification
   ↓
3. Business Registration Form
   - Company Name (required)
   - Business Type (required)
   - Business Details (tax ID, address, etc.)
   ↓
4. Account Created (auto-approved)
   ↓
5. Access Dashboard (/dashboard/overview)
```

### Business Types

Select from 9 categories during registration:

- **Retailer** - Retail stores and shops
- **Wholesaler** - Bulk suppliers
- **Distributor** - Distribution centers
- **Manufacturer** - Production facilities
- **Service Provider** - Service-based businesses
- **E-Commerce** - Online businesses
- **Corporate** - Large corporations
- **Non-Profit** - Non-profit organizations
- **Other** - Other business types

## Account Status Management

### Status Types

- **Approved** ✅ - Active account, can access dashboard
- **Blocked** ❌ - Account blocked by super admin (with reason)
- **Suspended** ⏸️ - Account suspended by super admin (with reason)
- **Pending** ⏳ - Awaiting approval (currently auto-approved)

### Super Admin Controls

Super admins can manage accounts at `/super-admin/accounts`:

- **View** all accounts with statistics
- **Filter** by status (Approved, Blocked, Suspended)
- **Block** accounts with reason
- **Suspend** accounts with reason
- **Unblock/Restore** accounts back to approved status

### Blocked User Experience

When a user's account is blocked:

- Redirected to `/access-denied` page
- Shown the block reason
- Contact support options provided

## Setup

- **Admin**: Set `NEXT_PUBLIC_ADMIN_USER_ID=<clerk-user-id>` in `.env.local`
- **Super Admin**: Set `NEXT_PUBLIC_SUPER_ADMIN_USER_IDS=<id1>,<id2>` in `.env.local`

---

**See also**: [ENTERPRISE_SIGNUP_QUICK_START.md](../../ENTERPRISE_SIGNUP_QUICK_START.md) for implementation details

---

## RBAC System

For detailed permission management and custom roles, see:
- **[RBAC Documentation](../rbac/README.md)** - Complete RBAC system
- **[PERMISSION_CATALOG.md](../rbac/PERMISSION_CATALOG.md)** - All available permissions
