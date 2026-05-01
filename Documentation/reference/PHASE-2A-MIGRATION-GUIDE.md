# Company Consolidation Migration Guide (Phase 2A)

**Status:** Implementation in progress  
**Date:** April 22, 2026  
**Goal:** Consolidate 3 tables (firms, companyDetails, organizationSettings) into 1 unified `companies` table

---

## What Changed

### Schema Changes

**Before:**
- `firms` — Firm tracking (ledger feature)
- `companyDetails` — Company info + VAT + URLs
- `organizationSettings` — Company metadata + business details

**After:**
- `companies` — **Unified table** (consolidates all 3)

### New Table Definition

```typescript
companies: defineTable({
  userId: v.string(),
  name: v.string(),
  owner: v.optional(v.string()),
  businessType: v.string(),
  type: v.string(),                    // "company" | "firm"
  address: v.string(),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  country: v.optional(v.string()),
  phone: v.array(v.string()),
  email: v.string(),
  website: v.optional(v.string()),
  taxNumber: v.string(),
  businessRegistration: v.optional(v.string()),
  isVerified: v.boolean(),
  logo: v.optional(v.string()),
  description: v.optional(v.string()),
  urls: v.array(v.object({ id: v.number(), value: v.string() })),
  processedBy: v.optional(v.string()),
  isDeleted: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
```

---

## API Changes

### Convex Queries & Mutations

| Old API | New API | File |
|---------|---------|------|
| `api.companyDetails.getCompanyDetails` | `api.companies.getCompany` | companyDetails → companies |
| `api.companyDetails.createCompanyDetails` | `api.companies.createCompany` | companyDetails → companies |
| `api.companyDetails.updateCompanyDetails` | `api.companies.updateCompany` | companyDetails → companies |
| `api.companyDetails.getCompanyNameById` | `api.companies.getCompanyName` | companyDetails → companies |
| `api.companyDetails.isBusinessProfileComplete` | `api.companies.isBusinessProfileComplete` | companyDetails → companies |
| `api.ledger.createFirm` | `api.companies.createCompany` (with type="firm") | ledger → companies |
| `api.ledger.deleteFirm` | `api.companies.deleteCompany` | ledger → companies |

---

## File Updates Required

### Frontend

| File | Changes | Priority |
|------|---------|----------|
| `src/app/(auth)/company-details/page.tsx` | Update queries: `api.companyDetails.*` → `api.companies.*` | HIGH |
| `src/features/settings/profile/components/ProfilePage.tsx` | Update queries | HIGH |
| `src/features/ledger/components/Ledger.tsx` | Update firm queries | HIGH |
| `src/app/(auth)/onboarding/setup/page.tsx` | Update org settings queries | HIGH |
| `src/app/(auth)/verify/page.tsx` | Update verification flow | HIGH |
| Any components using `companyDetails` query | Rename to `companies` | MEDIUM |

### Backend (Convex)

| File | Changes | Priority |
|------|---------|----------|
| `convex/companyDetails.ts` | **DEPRECATE** → Move all functions to `companies.ts` | HIGH |
| `convex/ledger.ts` | Remove createFirm/deleteFirm → call `companies.*` | HIGH |
| `convex/admin.ts` | Update company lookup queries | HIGH |
| Any other module querying companyDetails | Update imports | MEDIUM |

---

## Implementation Steps

### Step 1: Code Audit (✅ DONE)
- Identified 40+ references to companyDetails/organizationSettings/firms
- Found 3 main modules to update: companyDetails.ts, ledger.ts, schema.ts
- Created companies.ts with consolidated functions

### Step 2: Update Frontend Components

**2.1 Company Details Form** (`src/app/(auth)/company-details/page.tsx`)

```typescript
// Before
const createCompanyDetails = useMutation(
  api.companyDetails.createCompanyDetails
);
const companyDetails = useQuery(api.companyDetails.getCompanyDetails, {
  userId: user?.id ?? ''
});

// After
const createCompany = useMutation(
  api.companies.createCompany
);
const company = useQuery(api.companies.getCompany, {
  userId: user?.id ?? ''
});

// Update form data
if (company) {
  setFormData({
    name: company.name,
    address: company.address,
    phone: company.phone,
    // ...
  });
}
```

**2.2 Profile Page** (`src/features/settings/profile/components/ProfilePage.tsx`)

```typescript
// Before
const profile = useQuery(api.companyDetails.getCompanyDetails, {
  userId: user?.id as string
});
const createOrUpdateProfile = useMutation(
  api.companyDetails.createCompanyDetails
);

// After
const company = useQuery(api.companies.getCompany, {
  userId: user?.id as string
});
const createOrUpdateCompany = useMutation(
  api.companies.createCompany
);
```

**2.3 Ledger Component** (`src/features/ledger/components/Ledger.tsx`)

```typescript
// Before
const companyDetails = useQuery(
  api.companyDetails.getCompanyDetails,
  user?.id ? { userId: user.id } : 'skip'
);

// After
const company = useQuery(
  api.companies.getCompany,
  user?.id ? { userId: user.id } : 'skip'
);
```

### Step 3: Update Convex Modules

**3.1 Deprecate companyDetails.ts**
- Mark as deprecated with comment
- Re-export from companies.ts for backward compat if needed
- Or delete after verifying no remaining references

**3.2 Update ledger.ts**

```typescript
// Before: createFirm
export const createFirm = mutation({
  args: { name, owner, address, phone },
  handler: async (ctx, args) => {
    return await ctx.db.insert('firms', { ... });
  }
});

// After: Use companies.createCompany
export const createFirm = mutation({
  args: { name, owner, address, phone },
  handler: async (ctx, args) => {
    // Call companies.createCompany with type="firm"
    // Or forward the call
  }
});
```

**3.3 Update admin.ts**

```typescript
// Before
// const company = await ctx.db.query('company').first();

// After
const company = await ctx.db
  .query('companies')
  .withIndex('by_user_and_isDeleted', (q) =>
    q.eq('userId', userId).eq('isDeleted', false)
  )
  .first();
```

### Step 4: Test All Query Paths

Before deleting old tables, verify:
- [ ] `companies.getCompany` returns correct data
- [ ] `companies.createCompany` inserts correctly
- [ ] `companies.updateCompany` patches correctly
- [ ] All indexes work (check Convex dashboard)
- [ ] No console errors from type mismatches
- [ ] Soft-delete logic still works

### Step 5: Data Migration (Optional)

If you want to preserve old data during transition:

```typescript
export const migrateCompanyData = mutation({
  handler: async (ctx) => {
    const firms = await ctx.db.query('firms').collect();
    const companyDetails = await ctx.db.query('companyDetails').collect();
    const orgSettings = await ctx.db.query('organizationSettings').collect();
    
    let migratedCount = 0;

    // Migrate firms
    for (const firm of firms) {
      await ctx.db.insert('companies', {
        userId: firm.userId,
        name: firm.name,
        owner: firm.owner,
        address: firm.address,
        phone: [firm.phone || ''],
        email: '',              // Firms don't have email
        taxNumber: '',          // Firms don't have taxNumber
        businessType: 'business',
        type: 'firm',
        isDeleted: firm.isDeleted,
        createdAt: firm.createdAt,
        updatedAt: firm.updatedAt,
      });
      migratedCount++;
    }

    // Similar for companyDetails, organizationSettings...
    
    return { migratedCount };
  }
});
```

### Step 6: Cleanup (After Verification)

1. Delete deprecated functions from `companyDetails.ts`
2. Remove `firms` from schema (or keep as legacy reference)
3. Remove `organizationSettings` from schema
4. Remove `organizationSettings` from `schema.additions.ts`
5. Run tests to ensure no breakage

---

## Backward Compatibility Layer (Optional)

If you want to maintain backward compat temporarily:

```typescript
// convex/companyDetails.ts (deprecated)

// Re-export from companies with old names
export { getCompany as getCompanyDetails } from './companies';
export { createCompany as createCompanyDetails } from './companies';
export { updateCompany as updateCompanyDetails } from './companies';

// Add deprecation notice
/**
 * @deprecated Use api.companies.* instead
 * This module will be removed in Phase 2A completion
 */
```

This allows old code to still work while you gradually migrate.

---

## Verification Checklist

- [ ] Schema updated with new `companies` table ✅
- [ ] New Convex module `companies.ts` created ✅
- [ ] All frontend components updated to use api.companies.*
- [ ] All Convex modules updated to query `companies` table
- [ ] No TypeScript errors in IDE
- [ ] Queries tested in Convex dashboard
- [ ] Indexes verified (query performance)
- [ ] Soft-delete logic working
- [ ] Tests pass
- [ ] Old code references removed
- [ ] Old tables deleted from schema (after grace period)

---

## Rollback Plan

If issues arise:

1. Restore schema.ts from git (revert companies table addition)
2. Restore old module queries to use original tables
3. Frontend reverts automatically if you revert API calls
4. Keep companies.ts but don't use it

---

## Next Phase

After 2A completes:
- Phase 2B: Consolidate log tables (processLog)
- Phase 2C: Consolidate settings tables (userPreferences)
- Phase 2D: Consolidate settings tables (organizationConfig)

---

## References

- **New Schema:** `convex/schema.ts` (companies table)
- **New Module:** `convex/companies.ts`
- **Refactoring Plan:** `Documentation/reference/SCHEMA-REFACTORING-PLAN.md`
- **Schema Helpers:** `convex/lib/schemaHelpers.ts`
