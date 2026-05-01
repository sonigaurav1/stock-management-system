# ORGANIZATIONS Module

Multi-tenant support and company management.

## Responsibility

- Organization creation and lifecycle
- Company information management
- Team member management
- User roles and permissions
- Organization-wide settings
- Multi-tenant data isolation

## Company vs Organization Context (Current Project Reality)

This project uses two related concepts with different purposes:

### 1. Company
- Represents the business entity/profile.
- Stores legal, tax, contact, and branding data used in business operations.
- In practice, this maps to business profile records (for example, company details and consolidated company data).
- Typical fields: legal name, business type, tax number, business registration, address, contact info.

### 2. Organization
- Represents a collaboration/workspace container for ownership and team membership.
- Defines who owns the workspace and who can be members.
- Used for roles, membership, and team-level boundaries.

### Important implementation note
- Although organization tables exist, much of the core inventory/finance data is still scoped by userId in the current codebase.
- Treat organization features as partially implemented for cross-user shared data access unless explicitly wired in each module.

## Procedure: How to create Company and Organization

Recommended onboarding order for business owners:

1. Create or identify authenticated owner user.
2. Create Company profile (business identity and compliance fields).
3. Create Organization workspace (owner and membership container).
4. Add organization members and roles.
5. Wire module-level permission and tenancy checks before enabling shared multi-user operations.

## Decision Guide: When to create Company vs Organization

### Create Company when
- You need business identity for invoices, tax/compliance, and profile-level settings.
- You must store legal details such as tax number or business registration.

### Create Organization when
- You need multi-user collaboration (owner + managers/staff).
- You need invitations, membership, and role-based workspace management.

### Create both when
- The owner operates a real business and plans to add team members now or soon.

### Company only (acceptable)
- Solo-owner usage where no team collaboration is needed yet.

### Organization only (rare/temporary)
- A team shell is set up before full business profile is completed. This should usually be short-lived.

## isVerified Context (Developer Notes)

`isVerified` appears in business profile records and is meant to capture whether the business/tax identity has been verified.

### Where it exists
- `companies.isVerified` in consolidated company profile schema.
- `companyDetails.isVerified` in legacy company details schema.

### Why we keep it
- Distinguishes self-reported business info from verified business info.
- Supports future compliance gates (for example: high-trust actions, billing/tax-sensitive workflows).
- Provides a stable status for auditability and admin tooling.

### What it currently affects
- It is persisted and updated in verification-related flows.
- It is not yet enforced consistently across all business modules as a hard authorization gate.
- Treat it today as a business-state signal, not a complete security boundary.

### Who can change it (expected policy)
- Verification service flow (OTP/KYC/tax verification handler).
- Privileged admin/system mutation with explicit authorization checks.

### Who should NOT change it
- Regular profile update forms used by business owners.
- Client-driven calls that bypass verification logic.

### Recommended guardrail
- Keep `isVerified` out of general-purpose update mutations.
- Expose a dedicated verification-status mutation guarded by admin/system checks.
- If both `companies` and `companyDetails` remain active, define one source of truth and keep the other synchronized.

## Key Files

- **Backend**: `convex/organizations.ts`
- **Frontend**: `src/app/(auth)/company-details/` (setup page)

## Data Model

```typescript
Organization {
  _id: Id<"organizations">,
  ownerId: string,                    // Clerk user ID (creator)
  name: string,                       // Company name
  description?: string,
  logo?: string,                      // Image URL (EdgeStore)
  address: string,
  city: string,
  country: string,
  phone: string,
  email: string,
  
  members: Array<{
    userId: string,                   // Clerk user ID
    role: "owner" | "manager" | "staff",
    joinedAt: Date,
    email?: string,
  }>,
  
  settings: {
    taxRate?: number,                 // For invoices
    paymentTerms?: string,            // Default terms
    currency?: string,                // "INR", "USD", etc
    businessType?: string,            // Type of business
  },
  
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,                   // Soft delete
}
```

## Key Operations

### Create Organization (on Sign-up)
1. User completes sign-up with Clerk
2. User fills company details form
3. System creates organization document
4. Set user as owner
5. Initialize settings
6. Redirect to dashboard

```typescript
export const createOrganization = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const orgId = await ctx.db.insert("organizations", {
      ownerId: identity.subject,
      name: args.name,
      address: args.address,
      city: args.city,
      country: args.country,
      phone: args.phone,
      email: args.email,
      members: [{
        userId: identity.subject,
        role: "owner",
        joinedAt: new Date(),
        email: identity.email,
      }],
      settings: {
        currency: "INR",
        paymentTerms: "Net 30",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return orgId;
  },
});
```

### Get Organization
```typescript
export const getOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new ConvexError("Organization not found");
    return org;
  },
});
```

### Update Organization
```typescript
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
    settings: v.optional(v.object({
      taxRate: v.optional(v.number()),
      currency: v.optional(v.string()),
      paymentTerms: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const identity = await ctx.auth.getUserIdentity();
    const org = await ctx.db.get(args.organizationId);

    if (org.ownerId !== identity.subject) {
      throw new ConvexError("Only owner can update");
    }

    await ctx.db.patch(args.organizationId, {
      name: args.name || org.name,
      logo: args.logo || org.logo,
      settings: {
        ...org.settings,
        ...args.settings,
      },
      updatedAt: new Date(),
    });
  },
});
```

### Invite User to Organization
```typescript
export const inviteUserToOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("staff")),
  },
  handler: async (ctx, args) => {
    // Verify owner/manager
    const identity = await ctx.auth.getUserIdentity();
    const org = await ctx.db.get(args.organizationId);

    const userMember = org.members.find(m => m.userId === identity.subject);
    if (!userMember || !["owner", "manager"].includes(userMember.role)) {
      throw new ConvexError("Permission denied");
    }

    // Check if already member
    if (org.members.some(m => m.email === args.email)) {
      throw new ConvexError("User already in organization");
    }

    // Add to members (pending until user accepts)
    const updatedMembers = [...org.members, {
      userId: "", // Will be set when user signs up
      role: args.role,
      joinedAt: new Date(),
      email: args.email,
    }];

    await ctx.db.patch(args.organizationId, {
      members: updatedMembers,
      updatedAt: new Date(),
    });

    // Send invite email via SendGrid/Clerk
    // (Implementation depends on your email service)
  },
});
```

### Get User's Organizations
```typescript
export const getUserOrganizations = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const orgs = await ctx.db.query("organizations").collect();
    return orgs.filter(org =>
      org.members.some(m => m.userId === identity.subject)
    );
  },
});
```

## Role-Based Access Control

Three roles with permissions:

| Role | Can Do |
|------|--------|
| **Owner** | Everything (create, delete, invite, manage) |
| **Manager** | Invite users, manage products/sales, view reports |
| **Staff** | Create sales, view inventory, basic operations |

Implement via:
```typescript
function checkPermission(role: string, action: string): boolean {
  const permissions = {
    owner: ["all"],
    manager: ["invite", "products", "sales", "reports"],
    staff: ["sales", "inventory", "read"],
  };

  return permissions[role]?.includes(action) ?? false;
}
```

## Multi-Tenant Data Isolation

**Critical**: Every data table has `organization` field.

Example isolation in queries:
```typescript
// ✓ Always filter by org
const products = await ctx.db
  .query("products")
  .withIndex("by_organization", (q) =>
    q.eq("organization", args.organizationId)
  )
  .collect();

// ✗ Never expose org data without filter
const allProducts = await ctx.db.query("products").collect();
```

## Common Workflows

### Company Sign-up Flow
1. User signs up → Clerk account created
2. User fills company details
3. Organization created
4. User becomes owner
5. User added to members list
6. Dashboard loads with org context

### Invite Team Member Flow
1. Owner opens team settings
2. Enters team member email
3. Selects role (manager/staff)
4. System sends invite email
5. Team member receives email with join link
6. Team member signs up/logs in
7. Automatically added to org
8. Permissions set based on role

### Change Organization Settings
1. Owner goes to organization settings
2. Updates company info (logo, address, etc.)
3. Updates financial settings (tax rate, currency, payment terms)
4. Changes saved
5. Reflected in all invoices and reports

## Database Indexes

```typescript
organizations: defineTable({
  // ... fields
})
  .index("by_owner", ["ownerId"])
  .index("by_owner_deleted", ["ownerId", "deletedAt"])
```

## Testing Considerations

- Verify org creation on sign-up
- Test role-based access control
- Verify data isolation (org A can't see org B data)
- Test user invitation flow
- Test permission checks on mutations
- Verify multi-tenant safety
- Test role changes

## API Functions (In convex/organizations.ts)

```typescript
export const createOrganization = mutation({ ... })
export const updateOrganization = mutation({ ... })
export const deleteOrganization = mutation({ ... })  // Soft delete
export const getOrganization = query({ ... })
export const getUserOrganizations = query({ ... })
export const inviteUserToOrganization = mutation({ ... })
export const changeUserRole = mutation({ ... })
export const removeUserFromOrganization = mutation({ ... })
export const getOrganizationMembers = query({ ... })
```

## Security Considerations

1. **Ownership Verification**: Only owner can delete org
2. **Role Checks**: Every mutation verifies user role
3. **Data Isolation**: All queries filter by organization
4. **Email Verification**: Invites only to verified email addresses
5. **Audit Trail**: Track all org changes
6. **Soft Deletes**: Preserve data for history

## Related Documentation

- [AUTH.md](AUTH.md) - User roles and permissions
- [ADMIN.md](ADMIN.md) - System-wide org management
- [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md) - Schema details
- [API-GUIDE.md](../API-GUIDE.md) - Multi-tenant patterns

## Integration Points

Every other module depends on organizations:
- **PRODUCTS** - Filter by organization
- **SALES** - Filter by organization
- **LEDGER** - Track per organization
- **BILLING** - Invoices per organization
- **SUPPLIERS** - Manage per organization

All queries and mutations must include organization context.

