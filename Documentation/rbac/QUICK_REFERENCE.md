# RBAC Quick Reference & FAQ

Quick reference guide for Invento's Role-Based Access Control (RBAC) system.

## Quick Questions

### Q: How do I invite a staff with limited access?
**A:** 
1. Owner goes to `/settings/users`
2. Clicks "Invite Member"
3. Enters email, name, selects "Staff" role
4. Staff receives email invite
5. Signs up via Clerk
6. Automatically linked to owner's account
7. Logs in and sees only owner's data with staff permissions

### Q: What's the difference between `callerId` and `ownerId`?
**A:**
- `callerId` = The logged-in user's Clerk ID (who is making the request)
- `ownerId` = Whose data they're accessing
  - For Owner: same as callerId
  - For Staff: owner's ID
- **Always use `ownerId` for database queries!**

### Q: How do I check permissions in a component?
**A:**
```typescript
const { can, isOwner } = useUserRole();

if (can('manage_users')) {
  // Show invite button
}

if (isOwner) {
  // Show billing settings
}
```

### Q: How do I enforce permissions in backend?
**A:**
```typescript
export const deleteProduct = mutation({
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_PRODUCT);
    
    // Rest of mutation
  }
});
```

### Q: Can staff access other staff members' data?
**A:** No. All data is scoped to `ownerId`. Staff can only see owner's data.

### Q: Can owner access staff's personal data?
**A:** No. The system doesn't store staff's personal data. Owner only sees what they've assigned roles for.

### Q: What happens if I delete a custom role?
**A:** All staff with that role lose all permissions. They can still log in but can't do anything. Update their roles first.

### Q: Can staff invite other staff?
**A:** No. Only owners can manage users. Check `requirePermission(caller, PERMISSIONS.MANAGE_USERS)`.

### Q: How do I change a staff member's role?
**A:** Owner uses the UI: Settings → Users → Click member → Change role dropdown

### Q: How do I migrate existing users to this system?
**A:** 
1. Create companyMembers records with their emails and userId
2. Set status to "accepted" and acceptedAt to current timestamp
3. Assign them roles

### Q: Can I create custom roles?
**A:** Yes! Use the `createCustomRole` mutation. Add whatever permissions you want.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `convex/lib/permissions.ts` | All permission strings and role presets |
| `convex/lib/authHelper.ts` | Core auth logic (`resolveCallerContext`) |
| `convex/companyAccess.ts` | Invitation, acceptance, member management |
| `src/hooks/useUserRole.ts` | Frontend hook for permissions |
| `src/components/features/team/InviteMemberDialog.tsx` | Invite UI components |

---

## Common Tasks

### Task: Add new permission
1. Add to `PERMISSIONS` in `convex/lib/permissions.ts`
2. Add to preset roles you want it in (in `ROLE_PRESETS`)
3. Update queries/mutations that should check for it

### Task: Update someone's role
```typescript
await updateMemberRole({
  membershipId: "...",
  role: "manager"  // or "staff", "viewer"
});
```

### Task: Make permission read-only
1. Owner creates custom "Viewer" role
2. Only add view permissions (no create/edit/delete)
3. Assign staff to that role

### Task: Restrict by transaction amount
1. Create permission like `"approve_transactions_over_1000"`
2. Check in mutation: `if (amount > 1000) requirePermission(caller, ...)`
3. Assign to manager role only

---

## Performance Tips

### Tip: Cache permissions on client
The `useUserRole` hook already caches via Convex's built-in caching. No extra work needed.

### Tip: Batch permission checks
```typescript
// Instead of:
if (can('view_ledger') && can('manage_expenses')) { ... }

// Use:
if (canAll(['view_ledger', 'manage_expenses'])) { ... }
```

---

## Security Checklist

Before going to production:

- [ ] All queries use `resolveCallerContext(ctx)`
- [ ] All mutations check `requirePermission(caller, ...)`
- [ ] No query reads without filtering by `ownerId`
- [ ] No mutation modifies owner's data without permission check
- [ ] `getCallerContext` query only returns current user's context
- [ ] Cross-tenant access is impossible (test it!)
- [ ] Sensitive operations require explicit permissions
- [ ] Admins can audit who did what (via `teamActivity` table)

---

## Architecture Diagram

```
┌─ User Logs In via Clerk ──────┐
│                               │
│  Owner                  Staff  │
│  ↓                      ↓      │
│  Direct Access         Link    │
│  to own data          in DB    │
│  ↓                      ↓      │
└────→ resolveCallerContext() ←──┘
       ↓
       Returns MemberContext:
       - callerId (who is logged in)
       - ownerId (whose data to access)
       - permissions (what they can do)
       ↓
┌──────────────────────────────┐
│ Query checks:                │
│ 1. Authentication (identity?)│
│ 2. Authorization (permission?)│
│ 3. Data scope (ownerId)      │
└──────────────────────────────┘
       ↓
    Database query with ownerId filter
```

---

## Flow Diagram: Invite to Access

```
Owner creates credential
    ↓
Sends invite to staff@email.com
    ↓
companyMembers record created:
  - status: "invited"
  - role: "staff"
    ↓
Staff clicks email link & signs up via Clerk
    ↓
acceptInvitation() called:
  - Finds companyMembers by email
  - Sets userId = staff's Clerk ID
  - status → "accepted"
    ↓
Staff logs in next time
    ↓
resolveCallerContext() finds companyMembers
  - Discovers they're staff of owner_123
  - Returns ownerId = owner_123
    ↓
All queries now use owner_123 userId
  - Staff sees owner's products ✅
  - Staff cannot see other staff ❌
  - Staff cannot delete (no permission) ❌
```

---

## Permission Matrix

| Role | view | create | edit | delete | approve | manage |
|------|------|--------|------|--------|---------|--------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Staff | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

(Customize by editing `ROLE_PRESETS` in `convex/lib/permissions.ts`)

---

## Implementation Checklist

- [ ] Understand `resolveCallerContext` concept
- [ ] Wrap all queries with RBAC
- [ ] Wrap all mutations with RBAC
- [ ] Add invite UI to settings
- [ ] Integrate acceptance into signup flow
- [ ] Test with 2 users (owner + staff)
- [ ] Verify staff cannot see other orgs
- [ ] Verify permission checks work
- [ ] Deploy to staging
- [ ] Deploy to production

---

## Related Documents

- [PERMISSION_CATALOG.md](./PERMISSION_CATALOG.md) - Complete permission reference
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation guide
- [MIGRATION_EXAMPLES.md](./MIGRATION_EXAMPLES.md) - Migration code examples
