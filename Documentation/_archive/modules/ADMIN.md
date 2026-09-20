# ADMIN Module

System administration and developer controls.

## Responsibility

- User management and role assignment
- System monitoring and statistics
- Data inspection and debugging
- Organization management (admin only)
- System configuration
- Audit logging

## Key Files

- **Backend**: `convex/admin.ts`
- **Frontend**: `src/app/(developer-admin-page)/admin/`

## Access Control

**Admin Role Required**: Only users with "admin" or "owner" role can access.

Implemented via Clerk role check:
```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new ConvexError("Unauthorized");

// Check if admin (based on org role or Clerk metadata)
const org = await ctx.db.get(args.organizationId);
const isAdmin = org.members.find(m => m.userId === identity.subject)?.role === "owner";
if (!isAdmin) throw new ConvexError("Access denied");
```

## Key Functions

### User Management

#### Get All Users (System-Wide)
```typescript
export const getAllUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // Only system admins can list all users
    // Check against ADMIN_USER_IDS env variable or Clerk custom claim

    return ctx.db.query("users").collect();
  },
});
```

#### Assign Role to User
```typescript
export const assignUserRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("manager"), v.literal("staff")),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // Update user role in org.members
    // Log action
  },
});
```

#### Remove User from Organization
```typescript
export const removeUserFromOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // Remove from org.members
    // Log action
  },
});
```

### System Monitoring

#### Get System Statistics
```typescript
export const getSystemStats = query({
  handler: async (ctx) => {
    // Count organizations
    const orgCount = await ctx.db.query("organizations").count();

    // Count users
    const userCount = await ctx.db.query("users").count();

    // Count products
    const productCount = await ctx.db.query("products").count();

    // Total sales revenue
    const sales = await ctx.db.query("sales").collect();
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    return {
      organizations: orgCount,
      users: userCount,
      products: productCount,
      totalRevenue,
      timestamp: new Date(),
    };
  },
});
```

#### Get Organization Statistics
```typescript
export const getOrganizationStats = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Member count
    const org = await ctx.db.get(args.organizationId);
    const memberCount = org.members.length;

    // Product count
    const productCount = await ctx.db
      .query("products")
      .withIndex("by_organization", (q) => q.eq("organization", args.organizationId))
      .count();

    // Total sales
    const sales = await ctx.db
      .query("sales")
      .withIndex("by_organization", (q) => q.eq("organization", args.organizationId))
      .collect();

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    return {
      members: memberCount,
      products: productCount,
      sales: sales.length,
      revenue: totalRevenue,
    };
  },
});
```

### Data Inspection (Dangerous - Debug Only)

#### Inspect Organization Data
```typescript
export const inspectOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new ConvexError("Org not found");

    // Return full org details for inspection
    return org;
  },
});
```

#### Get Organization Products
```typescript
export const getOrganizationProducts = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("products")
      .withIndex("by_organization", (q) => q.eq("organization", args.organizationId))
      .collect();
  },
});
```

### Organization Management

#### Delete Organization (Dangerous!)
```typescript
export const deleteOrganization = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // DANGEROUS: Verify multiple times
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // Only allow system admins (not org owners)
    // Soft delete org
    // Mark all associated data as deleted
  },
});
```

#### Reset Organization Data (For Testing)
```typescript
export const resetOrganizationData = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Delete all products, sales, etc. for org
    // Keep org and users
    // FOR DEV/TEST ONLY
  },
});
```

## Audit Logging

All admin actions should be logged:

```typescript
// Create admin_logs collection
admin_logs: defineTable({
  organization: v.id("organizations"),
  action: v.string(),  // "user_added", "role_changed", "org_deleted"
  userId: v.string(),  // Who performed action
  targetId: v.optional(v.string()),  // What was affected
  timestamp: v.float(),
  details: v.object({}),
})
  .index("by_organization", ["organization"])
  .index("by_timestamp", ["organization", "timestamp"])
```

Then log every admin action:
```typescript
await ctx.db.insert("admin_logs", {
  organization: targetOrg,
  action: "role_changed",
  userId: identity.subject,
  targetId: targetUserId,
  timestamp: Date.now(),
  details: { oldRole, newRole },
});
```

## Admin Dashboard Features

The admin page (`/admin/`) should show:

1. **System Statistics**
   - Total organizations
   - Total users
   - Total revenue
   - Active products

2. **Organization List**
   - All organizations
   - Member counts
   - Last activity
   - Revenue per org

3. **User Management**
   - All users across system
   - Role assignment
   - Last login
   - Organizations per user

4. **Data Inspection** (Dev only)
   - Search specific org/product/sale
   - View raw data
   - Debug info

5. **System Actions** (Careful!)
   - Reset org data (testing)
   - Delete organization
   - Manual audit log entry

## Testing Considerations

- Verify only admins can access admin functions
- Test role assignment and changes
- Verify audit logging works
- Test organization statistics
- Test data inspection
- Test dangerous operations (deletion)
- Verify org isolation in stats

## API Functions (In convex/admin.ts)

```typescript
// User Management
export const getAllUsers = query({ ... })
export const assignUserRole = mutation({ ... })
export const removeUserFromOrganization = mutation({ ... })

// System Monitoring
export const getSystemStats = query({ ... })
export const getOrganizationStats = query({ ... })
export const getSystemHealth = query({ ... })

// Data Inspection
export const inspectOrganization = query({ ... })
export const getOrganizationProducts = query({ ... })
export const getOrganizationSales = query({ ... })

// Organization Management
export const deleteOrganization = mutation({ ... })      // Dangerous
export const resetOrganizationData = mutation({ ... })  // Testing only

// Audit Logging
export const getAuditLog = query({ ... })
export const logAdminAction = mutation({ ... })
```

## Security Best Practices

1. **Admin Role Check**: Every function verifies admin status
2. **Audit Trail**: All actions logged with timestamp and user
3. **Confirmation**: Dangerous actions require extra verification
4. **Rate Limiting**: Consider rate limiting admin actions
5. **IP Whitelist**: Optional: restrict admin access to specific IPs
6. **Session Management**: Auto-logout for admin sessions
7. **Alerts**: Notify on suspicious admin activity

## Dangerous Operations

Mark these functions clearly and require confirmation:

1. `deleteOrganization` - Irreversible
2. `resetOrganizationData` - Loses data
3. `removeAllUserSales` - Loses financial history
4. Mass operations without confirmation

## Related Documentation

- [AUTH.md](AUTH.md) - Role management
- [ORGANIZATIONS.md](ORGANIZATIONS.md) - Org structure
- [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md) - Schema details
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Debug tools

## Example Admin Workflow

1. Admin logs in with owner role
2. Admin navigates to /admin
3. Views system statistics
4. Selects organization to inspect
5. Views org members and their roles
6. Updates a user's role (e.g., staff → manager)
7. Action logged in audit trail
8. Confirmation email sent to user
9. User receives notification of role change
10. System enforces new permissions

