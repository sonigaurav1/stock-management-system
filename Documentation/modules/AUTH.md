# AUTH Module

Authentication system with Clerk integration.

## Responsibility

- User registration and sign-in
- Organization creation (after sign-up)
- User roles and permissions
- Session management
- Team member management

## Key Files

- **Backend**: `convex/admin.ts` - Auth checks and user management
- **Frontend**: `src/features/auth/` - Auth hooks and components
- **Provider**: `src/components/layout/providers.tsx` - Auth wrapper

## Architecture

```
User → Clerk Sign-In → Organization Setup → Convex Session
                          ↓
                      convex/admin.ts
                      (validate + create org)
```

## Key Flows

### Sign-up Flow
1. User fills sign-up form (email, password)
2. Clerk creates user
3. Redirect to company details page
4. User creates organization
5. Convex creates org record
6. Redirect to dashboard

### Sign-in Flow
1. User enters credentials
2. Clerk authenticates
3. Convex verifies organization
4. Dashboard loads with org context

## Key Functions

### Backend (convex/admin.ts)

```typescript
// Create organization after sign-up
export const createOrganization = mutation({
  args: { name: string, ... },
  handler: async (ctx, args) => {
    // Verify Clerk user
    // Create org document
    // Add user as owner
  }
})

// Get user organizations
export const getUserOrganizations = query({
  handler: async (ctx) => {
    // Get Clerk identity
    // Return user's orgs
  }
})

// Invite user to org
export const inviteUserToOrganization = mutation({
  args: { organizationId, email, role },
  handler: async (ctx, args) => {
    // Verify permissions
    // Add user to org members
    // Send invite email
  }
})
```

### Frontend (src/features/auth/hooks/useAuth.ts)

```typescript
// Get current auth state
export const useAuth = () => {
  const user = useUser(); // Clerk user
  const userOrganizations = useQuery(api.admin.getUserOrganizations);
  return { user, userOrganizations };
}

// Redirect logic for protected routes
export const useAuthRedirect = () => {
  // Redirect unauthenticated to sign-in
  // Redirect without org to company setup
}
```

## Integration Points

- **All modules** - Organization context used in every query
- **Billing** - Payment user verification
- **Admin** - Role-based access control
- **Notifications** - Send to org members

## Related Documentation

- [CONVENTIONS.md](../CONVENTIONS.md) - Auth patterns
- [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md) - User/org structure
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Auth issues
