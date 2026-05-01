# Role-Based Login System - Implementation Guide

## Overview

This document explains how the role-based login and account system works in the Inventory Management System.

## Role Assignment

### During Form Sign-Up (Step 1 & 2)

1. User fills **Step 1** (Personal Information): email, password, name, username
2. User fills **Step 2** (Business Information): company details, address, phone, etc.
3. On submit:
   - `handleSignUp()` creates the user account with default role: **`'Owner'`**
   - Clerk automatically creates the user in the backend
   - User gets `publicMetadata.role = 'Owner'`
   - Convex mutations save all business details
   - Company details are marked as submitted in Clerk metadata
   - User is redirected to `/dashboard/overview`

### During OAuth Sign-Up (Google)

1. User clicks "Sign up with Google"
2. Google OAuth flow completes, Clerk creates user
3. Default role is set to **`'User'`** (/api/roles endpoint)
4. User is redirected to `/company-registration` to fill in business details

### Role Setting

Three API endpoints handle role assignment:

- **`POST /api/roles`** - Set role during OAuth
- **`PATCH /api/roles`** - Update role anytime
- **`POST /api/company-details-submitted`** - Mark company details as submitted

## Clerk Metadata Structure (publicMetadata)

```javascript
{
  role: 'Owner' | 'Admin' | 'Editor' | 'User',           // User's role
  companyDetailsSubmitted: boolean,                       // Whether company info was filled
  companyDetailsSubmittedAt: '2026-04-20T19:44:56.594Z', // When it was submitted
  username: string                                        // User's username (optional)
}
```

## Role-Based Access Control

### Available Roles

- **Owner** - Full system access, billing, team management (default for form signup)
- **Admin** - Full system access except billing
- **Editor** - Can modify data, inventory, orders
- **User** - Read-only access (default for OAuth)

### Accessing Role in Components

```tsx
import { useUser } from '@clerk/nextjs';

export function MyComponent() {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role || 'User';

  if (userRole === 'Owner') {
    // Show owner-only features
  }
}
```

### Using in Convex Mutations

In your Convex functions, you can access the user's role from their metadata:

```typescript
export const myMutation = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userRole = identity?.publicMetadata?.role || 'User';

    if (userRole !== 'Owner' && userRole !== 'Admin') {
      throw new Error('Insufficient permissions');
    }
    // Continue with mutation...
  }
});
```

## Business Profile Flow

### BusinessProfileGuard Component

Located at: `src/features/auth/components/BusinessProfileGuard.tsx`

This guard ensures users have completed their business profile before accessing protected routes.

**Redirect Rules:**

1. Checks if `isProfileComplete` in Convex (checks if organizationSettings exists)
2. If Convex says complete → **Allow access** (company details were saved)
3. If not complete → Check Clerk metadata `companyDetailsSubmitted`
4. If still incomplete → **Redirect to /company-registration**

**Why this flow?**

- Convex data is the source of truth (what's actually saved in database)
- Clerk metadata might have sync delays
- Form-based signup: company details saved in Convex during step 2
- OAuth-based signup: company details need to be filled at `/company-registration`

## API Endpoints

### POST /api/roles (or PATCH)

**Purpose:** Set or update user's role in Clerk metadata

**Request:**

```json
{
  "userId": "user_3CdT8XvGff7WjZ73qW5qiOyCrqm",
  "role": "Owner"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User role set to Owner"
}
```

### POST /api/company-details-submitted

**Purpose:** Mark that user has completed company registration

**Request:**

```json
{
  "userId": "user_3CdT8XvGff7WjZ73qW5qiOyCrqm"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company details marked as submitted",
  "companyDetailsSubmitted": true,
  "companyDetailsSubmittedAt": "2026-04-21T10:30:00.000Z"
}
```

### PATCH /api/user-metadata

**Purpose:** Update other user metadata fields (username, custom fields)

**Request:**

```json
{
  "userId": "user_3CdT8XvGff7WjZ73qW5qiOyCrqm",
  "username": "john_doe",
  "customField": "value"
}
```

## Troubleshooting

### Issue: 404 on /api/roles

**Solution:** The endpoint is now created. Ensure files exist:

- `src/app/api/roles.ts`
- `src/app/api/company-details-submitted.ts`
- `src/app/api/user-metadata.ts`

### Issue: User keeps redirected to company-registration after form signup

**Solution:**

1. Check that Convex `organizationSettings` was created (see Convex DevTools)
2. Ensure `/api/company-details-submitted` call succeeded
3. If uncertain, the BusinessProfileGuard now trusts Convex data, so if organizationSettings exists, access is granted

### Issue: Role not showing up in components

**Solution:**

1. Ensure signup happened through `/api/roles` endpoint
2. Check Clerk Dashboard for user → publicMetadata → role field
3. In development, set default role in `/api/roles` endpoint to 'Owner'

## Next Steps for Role-Based Features

1. **Permission Catalog** - Reference: `src/features/teams/permissionCatalog.ts`

   - Define granular permissions per role type
   - Use in Convex for field-level access control

2. **Role Management UI** - Allow Owners/Admins to:

   - Change team member roles
   - Create custom roles (if needed)
   - Assign permissions

3. **Activity Audit** - Track role changes:

   - Who changed what role
   - Timestamp of change
   - Store in Convex auditLog table

4. **Onboarding by Role** - Different dashboards based on role:
   - Owner: Full overview + billing/team management
   - Admin: System settings + user management
   - Editor: Inventory, orders, products only
   - User: Reports and read-only views

## References

- **Auth Hook**: `src/features/auth/hooks/useAuth.ts`
- **Sign-Up Form**: `src/features/auth/components/SignUpForm.tsx`
- **Business Guard**: `src/features/auth/components/BusinessProfileGuard.tsx`
- **Permissions**: `src/features/teams/permissionCatalog.ts`
- **API Endpoints**: `src/app/api/{roles,company-details-submitted,user-metadata}.ts`
