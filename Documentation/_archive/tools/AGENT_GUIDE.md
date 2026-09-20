# Agent Guide for Inventory Management System

**Last Updated**: April 18, 2026  
**Scope**: Guidance for AI agents and developers on effective collaboration patterns in this codebase

---

## Quick Reference for Agents

This guide complements [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) and provides specific patterns for agents implementing features.

### Always Start Here

- **Project Context**: `@PROJECT_CONTEXT.md` — stack, tenancy model, conventions, known gaps
- **Workspace Instructions**: `.github/copilot-instructions.md` — principles, patterns, folder structure
- **One-Sentence Rule**: Always begin feature requests with task constraints (files/areas to touch or avoid)

### When to Consult Documentation

| Scenario               | Resource                                       | Time      |
| ---------------------- | ---------------------------------------------- | --------- |
| New to project         | `Documentation/DEVELOPER_QUICK_REFERENCE.md`   | 3-4 hours |
| Setup issues           | `Documentation/SETUP_DEPLOYMENT.md`            | 30 min    |
| Architecture decisions | `Documentation/ENTERPRISE_ARCHITECTURE.md`     | 1-2 hours |
| Feature specs          | Phase-specific docs (`Phase1_1/`, `Phase1_2/`) | 30-45 min |
| Feature inventory      | `Documentation/ENTERPRISE_FEATURES.md`         | 15 min    |
| Roadmap & priorities   | `Documentation/ENTERPRISE_ROADMAP.md`          | 30 min    |

---

## Implementation Workflow

### 1. Feature Request Breakdown

Before implementing, agents should clarify:

- **Domain**: Which area? (catalog, sales, accounting, team mgmt, compliance, etc.)
- **Tenancy**: User-scoped (`userId`) or org-scoped (`organizationId`)?
- **Permissions**: Admin-only, role-gated, or public?
- **UI location**: New page under `/settings/*`, main app, or dashboard widget?
- **DB schema**: New table, extend existing, or query-only?

### 2. Implement Schema First

**File**: `convex/schema.ts` (or new `convex/[domain].ts`)

```ts
// Pattern 1: User-scoped table (most common)
users_[resource]: defineTable({
  userId: v.string(),         // Clerk identity.subject
  [field]: v.string(),        // resource fields
  isDeleted: v.boolean(),     // soft delete
  createdAt: v.number(),      // Unix ms
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

// Pattern 2: Org-scoped table (emerging, less common)
organizations_[resource]: defineTable({
  organizationId: v.id('organizations'),
  [field]: v.string(),
  isDeleted: v.boolean(),
})
  .index('by_org_and_isDeleted', ['organizationId', 'isDeleted']),
```

**After editing `schema.ts`**: Run `npx convex codegen` to regenerate TypeScript types.

### 3. Add Mutations & Queries

**File**: `convex/[domain].ts` (create if new domain)

```ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query('users_[resource]')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', identity.subject).eq('isDeleted', false)
      )
      .collect();
  }
});

export const create = mutation({
  args: { name: v.string() },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db.insert('users_[resource]', {
      userId: identity.subject,
      name: args.name,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
});
```

**Key patterns**:

- Always call `await ctx.auth.getUserIdentity()` first
- Always check `if (!identity)` before proceeding
- Use `identity.subject` as `userId`
- Filter queries by `userId` + optionally by `isDeleted`
- Index with `by_user_and_isDeleted` for performance

### 4. Wire UI

**Location**: `src/features/[domain]/` or `src/app/(main)/(authenticated)/[domain]/`

```tsx
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function ResourceList() {
  const resources = useQuery(api.[domain].list);
  const createResource = useMutation(api.[domain].create);

  if (resources === undefined) return <div>Loading...</div>;
  if (resources === null) return <div>Not authenticated</div>;

  return (
    <div>
      {resources.map((r) => (
        <div key={r._id}>{r.name}</div>
      ))}
      <button
        onClick={() => createResource({ name: 'New' })}
      >
        Add
      </button>
    </div>
  );
}
```

**Key patterns**:

- Mark as `'use client'`
- Check `if (data === undefined)` for loading
- Check `if (data === null)` for auth failure
- Import `api` from `convex/_generated/api` (not hardcoded paths)

### 5. Add Navigation (if top-level page)

**File**: `src/constants/data.ts`

```ts
export const navItems = [
  // ... existing items
  {
    label: 'Resource Name',
    icon: IconComponent,
    href: '/resources',
    description: 'Manage resources'
  }
];
```

### 6. Test Both Servers

```bash
# Terminal 1
pnpm run convex

# Terminal 2
pnpm run dev
```

Visit `http://localhost:3000/resources` and test CRUD operations.

---

## Code Review Checklist for Agents

### Schema & Backend

- ✅ Used `userId: string` for single-tenant rows (unless org-scoped)
- ✅ Added `isDeleted: boolean` for data safety
- ✅ Added indexes (`by_user`, `by_user_and_isDeleted`) for performance
- ✅ Called `ctx.auth.getUserIdentity()` and checked `if (!identity)`
- ✅ Used `identity.subject` as `userId`, not user email or custom ID
- ✅ Ran `npx convex codegen` and regenerated types
- ✅ No plaintext passwords; all auth via Clerk
- ✅ Soft-delete queries filter `.eq('isDeleted', false)`

### Frontend & Permissions

- ✅ Marked interactive components as `'use client'`
- ✅ Used `useQuery` / `useMutation` from `convex/react`
- ✅ Handled `data === undefined` (loading) and `data === null` (auth fail)
- ✅ Reused permission strings from `src/features/teams/permissionCatalog.ts` (don't invent new ones)
- ✅ Wrapped pages in `<PageContainer>` for consistent layout
- ✅ Used `sonner` toasts for user feedback (not browser alerts)
- ✅ No auth checks in JSX; let Convex mutations enforce (they return errors if user not auth'd)

### UI & Styling

- ✅ Used shadcn/Radix components from `src/components/ui/`
- ✅ Followed Tailwind utility class patterns
- ✅ Applied dark mode classes (e.g., `dark:bg-slate-900`)
- ✅ No inline styles; prefer Tailwind
- ✅ Responsive design (mobile-first approach)

### Hydration & SSR

- ✅ Avoided auth-based conditionals that change DOM structure between SSR and client (e.g., `user && <Menu/>`)
- ✅ Used stable DOM with guest fallbacks
- ✅ If using Radix components (popover, dropdown), kept their ID trees consistent

### Documentation & Maintainability

- ✅ Added TSDoc comments on exported functions / components
- ✅ No magic strings; use constants or enums
- ✅ Types imported from `convex/_generated/dataModel` (not manually recreated)
- ✅ Related domain logic grouped in `src/features/[domain]/`
- ✅ No duplicate permission logic—centralize in shared helpers

---

## Common Patterns by Domain

### 1. Catalog (Products, Categories, Suppliers)

**Files**: `convex/products.ts`, `convex/categories.ts`, `convex/suppliers.ts`

**Pattern**:

- Table: `users_products`, `users_categories`, `users_suppliers`
- Indexes: `by_user`, `by_user_and_isDeleted`
- Queries: `list`, `getById`, `search`
- Mutations: `create`, `update`, `delete` (soft)

**UI**: `src/features/products/`, `src/features/suppliers/`, etc.

### 2. Sales & Payments

**Files**: `convex/sales.ts`, `convex/payments.ts`, `convex/billing.ts`

**Pattern**:

- Tables: `users_sales`, `users_payments`, `users_billing`
- Sales include line items (nested or separate table)
- Mutations enforce qty > 0, valid pricing
- Queries support filtering by date range, status, amount

**UI**: May include dialogs for payment capture, receipt generation

### 3. Accounting (Ledger, P&L, Cash Flow, Budget)

**Files**: `convex/ledger.ts`, `convex/profitAndLoss.ts`, `convex/cashFlow.ts`, `convex/budget.ts`

**Pattern**:

- Read-heavy (queries aggregate sales, expenses, payments)
- Ledger: double-entry bookkeeping (debit/credit, supplier/customer accounts)
- P&L, Cash Flow: derived from ledger and sales data
- Budget: soft constraints (warnings, not hard blocks)

**UI**: Dashboards, charts, reports

### 4. Team Management & Permissions

**Files**: `convex/teamManagement.ts`

**Pattern**:

- Custom roles (not just Admin/Editor/User)
- Team members scoped to user (org model is partial)
- Activity log for audits
- Approval workflows (requests → approve/reject)
- Does NOT enforce permissions app-wide; only in `teamManagement` mutations

**UI**: `src/features/teams/`

**Gotcha**: If adding permission-gated mutations elsewhere (e.g., products can only be created by admins), add checks manually; they won't cascade from team mgmt.

### 5. Compliance & Auditing

**Files**: `convex/compliance.ts`, `convex/auditLog.ts`

**Pattern**:

- Audit log captures action (created, updated, deleted), actor (userId), timestamp
- Compliance rules (tax, regulations) stored as configs
- Linked to sales/ledger for regulatory reports

**UI**: Mostly read-only dashboards and export tools

### 6. Automation & Insights

**Files**: `convex/automation.ts`, `convex/insights.ts`, `convex/reporting.ts`

**Pattern**:

- Automation: scheduled actions or event-driven rules (reorder when qty < threshold)
- Insights: computed analytics (top products, customer spend trends)
- Reporting: scheduled exports or on-demand reports

**UI**: Settings for rules, dashboard widgets for insights, export buttons for reports

### 7. Settings & Notifications

**Files**: `convex/settings.ts`, `convex/notifications.ts`, `convex/notificationPreferences.ts`

**Pattern**:

- Settings: company details, logo, email, integrations
- Notifications: transactional (order placed, payment received) or digest (daily summary)
- Preferences: user opts in/out per notification type

**UI**: Under `/settings/*` with nested layout

---

## Debugging Common Issues

### "Object is possibly 'undefined'" (useQuery)

**Cause**: Not checking `if (data === undefined)`

**Fix**:

```tsx
const data = useQuery(api.module.query);

// After this check, data is guaranteed to be an array or null (not undefined)
if (data === undefined) return <Skeleton />;
if (data === null) return <Unauthenticated />;

// Safe to use data
return <ul>{data.map(...)}</ul>;
```

### Hydration mismatch error

**Cause**: DOM structure differs between SSR and client (e.g., `user && <Popover/>`)

**Fix**: Keep stable DOM structure

```tsx
// ❌ BAD: conditionally renders Popover
function Menu({ user }) {
  return user ? <Popover>...</Popover> : null;
}

// ✅ GOOD: always renders shell, popover content changes
function Menu({ user }) {
  return (
    <Popover disabled={!user}>{user ? <Content /> : <GuestMsg />}</Popover>
  );
}
```

### "Convex operation not found"

**Cause**: `api.module.queryName` doesn't exist or typo in export

**Fix**: Verify export in `convex/module.ts`:

```ts
// In convex/products.ts
export const list = query({ ... }); // exports as api.products.list
export const create = mutation({ ... }); // exports as api.products.create
```

After editing, run `npx convex codegen` to regenerate `convex/_generated/api.ts`.

### "Not authenticated" error

**Cause**: `ctx.auth.getUserIdentity()` returned null (user not signed in)

**Fix**: Add auth check in mutation

```ts
export const create = mutation({
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    // ... proceed with userId = identity.subject
  }
});
```

---

## Agent-Specific Recommendations

### Plan Complex Features

For multi-step tasks (e.g., new dashboard widget that fetches data from 3 tables):

1. Break into tasks: schema → backend → frontend → UI integration
2. Use `manage_todo_list` to track progress
3. Test each layer independently before integrating

### Use Parallel Tool Calls When Safe

For independent operations (reading multiple files, searching), invoke tools in parallel if they don't depend on results from each other.

### Preserve Existing Conventions

When adding code adjacent to existing patterns (e.g., new mutation in `convex/products.ts`), match the style and structure of existing mutations.

### Link, Don't Duplicate

If documentation already exists (ENTERPRISE_ARCHITECTURE.md, SETUP_DEPLOYMENT.md), reference it rather than copying content.

### Validate Before Shipping

- ✅ Schema changes: `npx convex codegen`
- ✅ TypeScript: `pnpm lint` (ESLint) and `npx tsc --noEmit` (type check)
- ✅ Format: `pnpm format`
- ✅ Both dev servers running and tested locally

---

## When to Escalate

If uncertain about:

- **Org vs User tenancy**: Consult PROJECT_CONTEXT.md section "Tenancy & IDs"
- **Permission enforcement**: Check `src/features/teams/permissionCatalog.ts` and ask if should be app-wide or team-only
- **Architecture decision**: Review ENTERPRISE_ARCHITECTURE.md or ask product owner
- **Third-party integration**: Check `convex/integrations.ts` and ENTERPRISE_GUIDE.md for integration patterns

---

## Template Prompts for Agents

### Implement a new CRUD feature

```
Follow PROJECT_CONTEXT.md. Task: Add new [domain] CRUD with [specific fields].
Constraints: Keep in convex/[domain].ts and src/features/[domain]/*.
Add to navItems only if top-level page.
```

### Debug a hydration or auth issue

```
Follow PROJECT_CONTEXT.md + debugging.md in user memory.
Issue: [describe symptom].
Constraints: Do not change auth config; only fix component structure or SSR pattern.
```

### Integrate a third-party service

```
Follow PROJECT_CONTEXT.md + ENTERPRISE_GUIDE.md.
Task: Add [service] integration for [use case].
Constraints: Store API keys in .env.local; add mutation in convex/integrations.ts.
```

---

**Related Files**:

- `.github/copilot-instructions.md` — Workspace-level instructions
- `PROJECT_CONTEXT.md` — Project overview (read this first)
- `Documentation/DEVELOPER_QUICK_REFERENCE.md` — 1-week onboarding path
- `Documentation/ENTERPRISE_ARCHITECTURE.md` — System architecture
- `src/features/teams/permissionCatalog.ts` — Permission strings
- `convex/schema.ts` — Database schema (source of truth)
