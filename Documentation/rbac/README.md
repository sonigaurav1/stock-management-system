# Role-Based Access Control (RBAC)

**Complete guide to permissions, roles, and authorization in Invento**

This folder contains comprehensive documentation for implementing and managing role-based access control.

---

## 
### Quick Start
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick lookup guide
  - Permission names and descriptions
  - Role descriptions
  - Quick implementation patterns

### Complete Guides
- **[README.md](README.md)** - RBAC system overview
  - What is RBAC in Invento?
  - Key concepts
  - Roles and permissions
  - Implementation strategy

- **[PERMISSION_CATALOG.md](PERMISSION_CATALOG.md)** - Complete permission reference
  - All available permissions
  - Permission descriptions
  - Usage in code
  - Permission hierarchy

- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation
  - How to implement RBAC
  - Code patterns
  - Testing RBAC
  - Common pitfalls

### Migration & Examples
- **[MIGRATION_EXAMPLES.md](MIGRATION_EXAMPLES.md)** - Migration patterns
  - How to migrate existing code to RBAC
  - Before/after examples
  - Refactoring strategies

---

## 
### I need to check if user has permission
 [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### I need to add a permission check
 [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

### I need to see all available permissions
 [PERMISSION_CATALOG.md](PERMISSION_CATALOG.md)

### I need to migrate existing code
 [MIGRATION_EXAMPLES.md](MIGRATION_EXAMPLES.md)

### I need to understand the RBAC system
 [README.md](README.md)

---

## 
### Roles
- **Owner**: Full system access
- **Admin**: Administrative functions
- **Editor**: Create/edit content
- **Viewer**: Read-only access
- **Custom**: Custom role with specific permissions

### Permissions
Permissions follow naming convention: `{resource}.{action}`

Examples:
- `products.create`
- `products.edit`
- `products.delete`
- `sales.view`
- `billing.manage`

### Role Hierarchy
```
Owner (all permissions)
 Admin (most permissions except system config)  
 Editor (create/edit permissions)     
 Viewer (read-only)        
 [Custom roles]     
 [Custom roles]  
```

---

## 
### Check Permission (Frontend)
```typescript
const user = useUser();
if (user?.publicMetadata?.permissions?.includes('products.edit')) {
  // Show edit button
}
```

### Check Permission (Backend)
```typescript
const identity = await ctx.auth.getUserIdentity();
const hasPermission = identity?.publicMetadata?.permissions?.includes('products.edit');
if (!hasPermission) throw new Error('Unauthorized');
```

### Add Permission to User
```typescript
// Via Clerk dashboard or API
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    permissions: ['products.create', 'products.edit']
  }
});
```

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for detailed patterns.

---

## 
```
rbac/
 README. RBAC overviewmd                      
 Quick lookup
 All permissions
 How to implement
 Migration patterns
```

---

## 
### Products
- `products.view` - View products
- `products.create` - Create products
- `products.edit` - Edit products
- `products.delete` - Delete products

### Sales
- `sales.view` - View sales
- `sales.create` - Create sales order
- `sales.edit` - Edit sales
- `sales.delete` - Delete sales

### Billing
- `billing.view` - View billing
- `billing.manage` - Manage billing
- `billing.download` - Download invoices

See [PERMISSION_CATALOG.md](PERMISSION_CATALOG.md) for complete list.

---

## 
### Grant User Permission
1. Go to user in Clerk dashboard
2. Edit metadata
3. Add permission to permissions array
4. Save

### Create Custom Role
1. Define permissions
2. Store role configuration
3. Assign to users
4. Test permissions

### Check Permission in Code
1. Get user identity
2. Check publicMetadata.permissions array
3. Throw error if unauthorized
4. Continue if authorized

---

## 
```typescript
// Test permission check
describe('Permission Check', () => {
  test('admin can create products', async () => {
    // Set admin permissions
    // Try to create product
    // Should succeed
  });

  test('viewer cannot create products', async () => {
    // Set viewer permissions
    // Try to create product
    // Should fail
  });
});
```

---

 Security Principles## 

1. **Always check permissions on backend** - Never trust client
2. **Use permission constants** - Avoid hardcoded strings
3. **Test all code paths** - Both allowed and denied cases
4. **Audit permission changes** - Log who changed what
5. **Review permissions regularly** - Keep them current

---

## 
| Need | Go To |
|------|-------|
| Architecture | [../reference/ARCHITECTURE.md](../reference/ARCHITECTURE.md) |
| Code patterns | [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md) |
| Conventions | [../reference/CONVENTIONS.md](../reference/CONVENTIONS.md) |
| Modules | [../modules/](../modules/) |
| Troubleshooting | [../tools/TROUBLESHOOTING.md](../tools/TROUBLESHOOTING.md) |

---

## 
1. Read: [README.md](README.md) - Understand the system
2. Reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Know available permissions
3. Implement: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Add to code
4. Catalog: [PERMISSION_CATALOG.md](PERMISSION_CATALOG.md) - Complete reference
5. Migrate: [MIGRATION_EXAMPLES.md](MIGRATION_EXAMPLES.md) - Update existing code

---

 Common Questions## 

**Q: How do I check if a user can do something?**
A: Get their permissions from `identity.publicMetadata.permissions` and check array.

**Q: What's the naming convention for permissions?**
A: `{resource}.{action}` - e.g., `products.create`

**Q: Can I create custom permissions?**
A: Yes, define them in PERMISSION_CATALOG.md and use consistently.

**Q: How do I assign permissions to users?**
A: Update Clerk user metadata with permissions array.

**Q: Should I check permissions on frontend?**
A: Only for UX. Always check on backend for security.

---

## 
1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick answers
2. Check [PERMISSION_CATALOG.md](PERMISSION_CATALOG.md) for permission names
3. Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for how-to
4. Check [MIGRATION_EXAMPLES.md](MIGRATION_EXAMPLES.md) for examples
5. Ask your team for clarification

---

**Last Updated**: 2026-05-10  
**Maintained By**: Security Team  
**Related**: [/Documentation/INDEX.md](../INDEX.md)
