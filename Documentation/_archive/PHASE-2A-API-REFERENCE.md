# Phase 2A API Migration - Quick Reference

## Updated API Calls

### Company Queries
```typescript
// OLD
const companyDetails = useQuery(api.companyDetails.getCompanyDetails);
const settings = useQuery(api.organizations.getOrganizationSettings, { userId });

// NEW
const company = useQuery(api.companies.getCompany, { userId });
```

### Company Mutations - Creation
```typescript
// OLD - During signup, two separate calls:
await upsertOrganizationSettings({ userId, companyName, ... });
await createCompanyDetailsFromRegistration({ userId, companyName, ... });

// NEW - Single call:
await createCompanyFromRegistration({ userId, companyName, ... });
```

### Company Mutations - Updates
```typescript
// OLD
const updated = await updateCompanyDetails({ 
  companyName, address, taxNumber, ... 
});

// NEW
const updated = await updateCompany({ 
  companyId, 
  name, address, taxNumber, ... 
});
```

### Business Profile Validation
```typescript
// OLD
const isComplete = useQuery(api.companyDetails.isBusinessProfileComplete, { userId });

// NEW
const isComplete = useQuery(api.companies.isBusinessProfileComplete, { userId });
```

## Field Name Mappings

When updating from old schema to new:

| Old Field Name | New Field Name | Table |
|---|---|---|
| companyName | name | companies |
| companyAddress | address | companies |
| vatNumber | taxNumber | companies |
| phone | phone | companies |
| email | email | companies |
| website | website | companies |
| businessType | businessType | companies |
| owner | owner | companies |
| type | type | companies (use "company", "firm", etc.) |

## Files Updated

### Frontend Components (11 total)
1. ✅ ProfilePage.tsx - Get/update company in settings
2. ✅ useInvoiceProcessing.tsx - Get company for invoices
3. ✅ InvoiceViewer.tsx - Display company info on invoices
4. ✅ AppSidebar.tsx - Show company name in sidebar
5. ✅ BusinessProfileGuard.tsx - Verify profile completeness
6. ✅ SignUpForm.tsx - **Removed redundant upsertOrganizationSettings**
7. ✅ BusinessRegistrationForm.tsx - **Removed redundant upsertOrganizationSettings**
8. ✅ business-details-setup/page.tsx - Create/update company
9. ✅ Ledger.tsx - Get company for ledger
10. ✅ OverviewPage.tsx - Display company info
11. ✅ onboarding/setup/page.tsx - Setup flow

### Backend Modules (3 updated)
1. ✅ convex/companies.ts - **New unified module**
2. ✅ convex/ledger.ts - Updated firm creation/queries
3. ✅ convex/admin.ts - Updated statistics

## Deprecation Timeline

### Tables Still in Schema (can be removed after transition)
- `firms` (replaced by companies with type="firm")
- `companyDetails` (consolidated into companies)
- `organizationSettings` (consolidated into companies)

### Convex Module Status
- `companyDetails.ts` - **Still exists but deprecated**
  - Consider deprecation notice in code
  - No new code should import this
  - Safe to remove after data migration
  
- `organizations.ts` - **Partially deprecated**
  - `upsertOrganizationSettings` - Removed from frontend (use companies module)
  - Organization management functions still needed

## Testing Checklist

- [ ] Signup flow creates company successfully
- [ ] Company appears in sidebar after login
- [ ] Settings page shows company details
- [ ] Invoice generation includes company info
- [ ] Company update saves all fields correctly
- [ ] Business profile completion check works
- [ ] Ledger shows company-specific transactions

## Compilation Status

✅ **All TypeScript checks passed**
- No type errors related to schema changes
- All API imports correctly resolve
- All field accesses are type-safe

## Next Steps

1. **Run dev server**: `npm run dev` + `npm run convex`
2. **Test signup**: Create new account and verify company creation
3. **Test updates**: Update company details and verify changes
4. **Monitor logs**: Check Convex dashboard for any query errors
5. **Document findings**: Record any issues for Phase 2B planning

---

**Reference**: See [PHASE-2A-COMPLETION-SUMMARY.md](PHASE-2A-COMPLETION-SUMMARY.md) for detailed information
