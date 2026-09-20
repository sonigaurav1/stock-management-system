# Enterprise Sign-Up Implementation Guide

## Overview

This document describes the complete enterprise sign-up workflow for business owners to access the inventory management system.

## ✅ What's Been Implemented

### 1. Database Schema

- **`accountStatus` table** - Tracks account status, business type, and admin controls
  - Status: approved, pending, blocked, suspended
  - Business types: retailer, wholesaler, distributor, manufacturer, service, e_commerce, corporate, nonprofit, other
  - Tracks who blocked accounts and when

### 2. Backend (Convex)

**File**: `convex/accountStatus.ts`

- `createAccountStatus` - Create account on signup (auto-approved)
- `checkUserAccess` - Verify if user can access dashboard
- `blockAccount` - Super admin action: block user
- `unblockAccount` - Super admin action: unblock user
- `suspendAccount` - Super admin action: suspend user
- `getAllAccounts`, `getAccountsByStatus` - Super admin queries
- `updateBusinessType` - User can update their business type

**File**: `convex/organizations.ts`

- `upsertOrganizationSettings` - Create/update company details
- `getOrganizationSettings` - Retrieve company info

### 3. Frontend Pages

#### User Sign-Up Flow

1. **`/sign-in`** → Clerk authentication (existing)
2. **`/verify`** → Email verification (updated to redirect to registration)
3. **`/company-registration`** → Business registration form
   - Form fields:
     - Company Name (required)
     - Business Type (required) - Dropdown with 9 options
     - Tax ID, GST/VAT Number
     - Full address (address, city, state, postal code, country)
     - Phone, Website
4. **`/company-registration/success`** → Success confirmation
   - Links to dashboard and admin panel

#### Super Admin Panel

- **`/super-admin/accounts`** → Account management dashboard
  - View all accounts with stats (total, approved, blocked, suspended)
  - Filter by status
  - Actions per account:
    - Block (approved accounts only) - requires reason
    - Unblock (blocked accounts only)
    - Suspend (approved accounts only) - requires reason
    - Restore (suspended accounts only)

#### Access Control

- **`/access-denied`** → Shown when user is blocked/suspended

### 4. Components

#### `src/features/auth/BusinessRegistrationForm.tsx`

- Comprehensive form with all business details
- Handles form submission and API calls
- Shows loading state and error handling

#### `src/components/auth/AccountStatusGuard.tsx`

- Wraps authenticated routes
- Checks account status before rendering
- Redirects blocked users to access-denied page
- Shows loading spinner during checks

### 5. Access Control

The `AccountStatusGuard` is applied to:

- `src/app/(main)/(authenticated)/layout.tsx` - Protects all dashboard routes
- This means: `/dashboard/overview`, `/inventory`, `/admin`, etc. all require approved account status

## 🚀 How to Use

### For Business Owners (End Users)

1. **Sign up**: Visit `/sign-up` and create account with Clerk
2. **Verify email**: Complete Clerk email verification
3. **Register business**: Fill out business registration form at `/company-registration`
4. **Access dashboard**: Automatically redirected to `/dashboard/overview`
5. **Manage settings**: Update business info in settings

### For Super Admins (Developers)

1. **Set environment variable**:

   ```
   NEXT_PUBLIC_SUPER_ADMIN_USER_IDS=<your-clerk-user-id1>,<your-clerk-user-id2>
   ```

2. **Access admin panel**: Go to `/super-admin/accounts`

3. **Manage accounts**:
   - View all accounts with statistics
   - Filter by status (Approved, Blocked, Suspended, Pending)
   - Block accounts with reason
   - Unblock or restore suspended accounts

## 📊 Account Status Flow

```
User Signs Up
  ↓
Account created with status = "approved" (auto-approved)
  ↓
Can access /dashboard/overview and /admin
  ↓
Super Admin can:
  - Block (status = "blocked") + reason
  - Suspend (status = "suspended") + reason
  ↓
If blocked/suspended: User sees "Access Denied" message
```

## 🔧 Configuration

### Environment Variables

```
NEXT_PUBLIC_SUPER_ADMIN_USER_IDS=user_id1,user_id2
```

### Business Types (Enum in form)

```
- retailer
- wholesaler
- distributor
- manufacturer
- service_provider
- e_commerce
- corporate
- nonprofit
- other
```

## 📝 Database Schema

### accountStatus Table

```typescript
{
  _id: Id<"accountStatus">
  userId: string // Clerk user ID
  status: "pending" | "approved" | "blocked" | "suspended"
  businessType: string // Enum value
  approvedBy?: string // Super admin who approved
  approvedAt?: number // Timestamp
  blockedBy?: string // Super admin who blocked
  blockedAt?: number // Timestamp
  blockedReason?: string // Reason for blocking
  createdAt: number
  updatedAt: number
}
```

### organizationSettings Table (Updated)

```typescript
{
  userId: string
  companyName: string
  businessType: string
  taxNumber: string
  gstNumber: string
  businessRegistration?: string
  address: string
  city: string
  state: string
  postalCode?: string
  country: string
  phone?: string
  email: string
  website?: string
  description?: string
  logo?: string
  createdAt: number
  updatedAt: number
}
```

## 🔐 Security

1. **Auth checks**: All mutations verify user identity with Clerk
2. **Super admin only**: Account blocking requires super admin status
3. **Reason tracking**: All blocking actions logged with reason
4. **Access denied**: Clear message shown to blocked users
5. **Soft deletion ready**: Schema supports future soft delete if needed

## 🚦 Future Enhancements

### Billing Integration (Phase 2)

- Link account status to subscription tier
- Add `subscriptionPlan` field to accountStatus
- Add trial period logic
- Payment verification before access

### Email Notifications

- Send confirmation email on account creation
- Notify users when account is blocked/suspended
- Notify admins of new registrations

### Activity Logging

- Log all account status changes
- Create audit trail for admin actions
- Export audit logs

### Advanced Filtering

- Filter accounts by business type
- Search by company name
- Filter by creation date range
- Export account list

## 🧪 Testing

### Test Scenarios

1. **New User Sign-Up**

   - Sign up → Verify → Register business → Access dashboard

2. **Block Account**

   - Go to `/super-admin/accounts`
   - Select approved account
   - Click "Block" and enter reason
   - User redirected to `/access-denied` page

3. **Unblock Account**

   - Go to `/super-admin/accounts`
   - Select blocked account
   - Click "Unblock"
   - Account restored to approved status

4. **Suspend Account**
   - Go to `/super-admin/accounts`
   - Select approved account
   - Click "Suspend" and enter reason
   - User redirected to `/access-denied` page

## 📚 API Reference

### Backend Mutations

```typescript
// Create account on signup
api.accountStatus.createAccountStatus({
  userId: string
  businessType: string
})

// Block account (super admin)
api.accountStatus.blockAccount({
  userId: string
  reason: string
})

// Unblock account (super admin)
api.accountStatus.unblockAccount({
  userId: string
})

// Suspend account (super admin)
api.accountStatus.suspendAccount({
  userId: string
  reason: string
})

// Update business type
api.accountStatus.updateBusinessType({
  userId: string
  businessType: string
})

// Upsert organization settings
api.organizations.upsertOrganizationSettings({
  userId: string
  companyName: string
  businessType: string
  taxNumber: string
  gstNumber: string
  address: string
  city: string
  state: string
  postalCode?: string
  country: string
  phone?: string
  email: string
  website?: string
  description?: string
  logo?: string
})
```

### Backend Queries

```typescript
// Check if user has access
api.accountStatus.checkUserAccess({
  userId: string
}); // Returns: { hasAccess: boolean, reason?: string, status: string }

// Get current user's account status
api.accountStatus.getAccountStatus({
  userId: string
});

// Get all accounts (super admin)
api.accountStatus.getAllAccounts();

// Get accounts by status (super admin)
api.accountStatus.getAccountsByStatus({
  status: string
});

// Get organization settings
api.organizations.getOrganizationSettings({
  userId: string
});
```

## 🎯 Next Steps

1. **Run codegen**:

   ```bash
   npx convex codegen
   ```

2. **Test the flow**:

   - Sign up as new user
   - Complete registration
   - Access dashboard
   - Test admin blocking

3. **Update verify page** (already done):

   - Redirects to `/company-registration` instead of `/company-details`

4. **Monitor accounts**:
   - Visit `/super-admin/accounts` to manage accounts

## 📞 Support

For questions or issues:

- Check the implementation guide: `ENTERPRISE_SIGNUP_PLAN.md`
- Review the code: `convex/accountStatus.ts`, `convex/organizations.ts`
- Check frontend: `src/features/auth/BusinessRegistrationForm.tsx`

---

**Last Updated**: April 18, 2026
**Status**: ✅ Fully Implemented
