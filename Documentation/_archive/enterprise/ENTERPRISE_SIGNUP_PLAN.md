# Enterprise Sign-Up System - Implementation Plan

## Overview

Enterprise-level sign-up workflow allowing business owners to register, select business type, and access `/dashboard/overview` and `/admin` systems. System admin can block/approve accounts via developer panel. No billing system required (framework for future).

## System Components

### 1. Database Schema Changes

#### New Table: `accountStatus`

```
- userId: string (Clerk ID)
- status: "pending" | "approved" | "blocked" | "suspended"
- businessType: string (retailer, wholesaler, distributor, manufacturer, service, etc.)
- approvedBy: string (super-admin user ID who approved)
- blockedBy: string (super-admin user ID who blocked)
- blockedReason: string (reason for blocking)
- createdAt: number
- updatedAt: number
- indexes: by_user, by_status
```

#### Update: `organizationSettings`

- Add `accountStatus` reference
- Add `businessRegistration` validation
- Add `approvalDate` field

### 2. Workflow Stages

```
1. Sign Up (Clerk) → Redirects to business registration
2. Business Registration → Form with business details + type selection
3. Account Created → Status: "pending" (auto-approved for now, or manual)
4. Dashboard Access → Conditional based on account status
5. Block/Suspend → Via Super Admin Developer Panel
```

### 3. Business Type Enumeration

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

### 4. Routes & Pages

#### Auth Flow

- `/sign-up` → Clerk sign-up (existing)
- `/company-registration` → NEW - Business details form
- `/company-registration/success` → Confirmation page

#### Super Admin Panel

- `/super-admin/accounts` → NEW - Account management
- `/super-admin/accounts/[userId]` → NEW - Account details & blocking controls

#### Main App

- `/dashboard/overview` → Protected (check account status)
- `/admin` → Protected (check account status + admin role)

### 5. Access Control Logic

```
Dashboard/Admin Access:
- User must be authenticated (Clerk)
- User must have accountStatus = "approved"
- Admin route also requires admin role
- Block status returns "Access Denied" with reason
```

### 6. Implementation Steps

1. **Schema Updates** (convex/schema.ts)

   - Add `accountStatus` table
   - Update `organizationSettings`
   - Run `npx convex codegen`

2. **Backend Mutations & Queries** (convex/organizations.ts + convex/admin.ts)

   - Create account on signup
   - Block/unblock account
   - Update account status
   - Check account eligibility

3. **Frontend Pages**

   - `/company-registration` - Business registration form
   - `/super-admin/accounts` - Account management dashboard
   - Protected layout wrapper for access control

4. **UI Components**

   - `BusinessTypeSelector` component
   - `AccountStatusBadge` component
   - `BlockAccountModal` component

5. **Middleware/Guards**
   - Protected layout checks account status
   - Redirect blocked users appropriately
   - Toast notifications for status changes

## Data Flow Diagram

```
User Signs Up (Clerk)
  ↓
Verify Email
  ↓
/company-registration Page
  ↓
Submit Business Details + Type
  ↓
Create accountStatus record (status: "approved")
  ↓
Redirect to /dashboard/overview
  ↓
[Super Admin can block via /super-admin/accounts]
  ↓
If blocked: Show "Access Denied" message
```

## Key Files to Create/Edit

### Create

- `convex/accountStatus.ts` - Account status mutations/queries
- `src/features/auth/BusinessRegistrationForm.tsx` - Sign-up form
- `src/app/(auth)/company-registration/page.tsx` - Registration page
- `src/app/(developer-admin-page)/super-admin/accounts/page.tsx` - Account management
- `src/components/auth/AccountStatusGuard.tsx` - Protected wrapper

### Edit

- `convex/schema.ts` - Add accountStatus table
- `convex/organizations.ts` - Add account creation logic
- `src/app/(main)/(authenticated)/layout.tsx` - Add status check
- `src/app/(main)/(authenticated)/admin/layout.tsx` - Add admin access guard

## Future Billing Integration Points

When adding billing:

- Link `accountStatus` to subscription tier
- Add `subscriptionPlan` field
- Add trial period logic
- Payment requirement check on access

---

**Status**: Ready for implementation
**Priority**: High (foundational for enterprise feature)
