# Schema Refactoring Plan - Phase 1 & 2

**Status:** In Progress (Apr 22, 2026)  
**Goal:** Consolidate 67 tables → 50 tables; eliminate redundancy; improve maintainability

---

## Executive Summary

The current schema has 6 major redundancy patterns:

1. **Boilerplate duplication** (soft-delete, timestamps on 67 tables)
2. **Conflated company metadata** (companyDetails + organizationSettings + firms)
3. **Excessive log tables** (8 separate log/history tables)
4. **Fragmented settings** (10 settings/config tables)
5. **Receipt/invoice confusion** (expenses + expenseReceipts overlap)
6. **Inconsistent location references** (string vs v.id())

**Solution:** Implement helpers, consolidate tables, update code to match.

---

## Phase 1: Schema Helpers & Standards

### Status: ✅ COMPLETE

**File:** `convex/lib/schemaHelpers.ts`

Provides reusable functions:
- `withUserTenancy()` — userId field
- `withSoftDelete()` — isDeleted + index
- `withTimestamps()` — createdAt + updatedAt
- `withStandardAudit()` — all three combined
- `withLocationSupport()` — locationId field
- `indexFor()` — index builder
- `STANDARD_INDEXES` — pre-defined common indexes
- Reusable shape definitions (auditLogEntry, approvalStep, reportFilter, etc.)

**Next:** Update schema.ts to use these helpers.

---

## Phase 2: Table Consolidation

### 2A. Consolidate Company Metadata

**Current (3 tables):**
- `companyDetails` — company info + VAT
- `organizationSettings` — same + business type + logo
- `firms` — legacy firm tracking

**Target (1 table):** `companies`

**New Schema:**
```typescript
companies: defineTable({
  userId: v.string(),           // Tenant
  name: v.string(),
  owner: v.optional(v.string()),
  businessType: v.string(),     // "retailer", "wholesaler", etc.
  address: v.string(),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  country: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  phone: v.array(v.string()),
  email: v.string(),
  website: v.optional(v.string()),
  logo: v.optional(v.string()),
  
  // Tax/Legal
  taxNumber: v.string(),        // VAT / Pan number
  businessRegistration: v.optional(v.string()),
  isVerified: v.boolean(),
  
  // Metadata
  type: v.string(),             // "company" | "firm" (preserve firm distinction if needed)
  
  ...withSoftDelete(),
  ...withTimestamps(),
})
  .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
  .index('by_user_and_type', ['userId', 'type'])
```

**Code Updates Required:**

| File | Change | Impact |
|------|--------|--------|
| `convex/companyDetails.ts` | Update/merge mutations | Update `companies.ts` |
| `src/features/settings/*` | Update query calls | Change from `getCompanyDetails` to `getCompany` |
| `src/app/(main)/(authenticated)/settings/organization` | Form updates | Reference unified table |
| `convex/invoices.ts` | Denormalize companyName on invoices | Keep performant (read-time denorm OK) |

**Migration Script Needed:** Copy data from companyDetails → companies table.

---

### 2B. Consolidate Log Tables

**Current (8 separate tables):**
- `auditLog` — user actions
- `webhookExecutionLog` — webhook runs
- `reportExecutions` — report runs  
- `bulkOperationJobs` — bulk job tracking
- `duplicateDetectionLog` — duplicate detection
- `expenseApprovals` — (embedded workflow history - KEEP)
- `transactionCategoryMappings` — (suggestion history - KEEP)
- `reconciliationMatches` — (reconciliation history - KEEP)

**Target (2 tables):**

1. **`auditLog`** (unified action log) — KEEP existing, rename to clarify
2. **`processLog`** (background jobs, scheduled tasks) — NEW, replaces webhookExecutionLog, reportExecutions, bulkOperationJobs

**New `processLog` schema:**
```typescript
processLog: defineTable({
  userId: v.string(),
  processType: v.string(),      // "webhook", "report", "bulk_op", "sync", "scheduled_job"
  processId: v.string(),        // jobId, webhookId, reportId, etc.
  
  // Execution tracking
  status: v.string(),           // "pending", "processing", "completed", "failed"
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  durationMs: v.optional(v.number()),
  
  // Webhook-specific
  url: v.optional(v.string()),
  event: v.optional(v.string()),
  statusCode: v.optional(v.number()),
  
  // Report/Bulk-specific
  rowsProcessed: v.optional(v.number()),
  successCount: v.optional(v.number()),
  failureCount: v.optional(v.number()),
  
  // Error tracking
  error: v.optional(v.string()),
  errorDetails: v.optional(v.any()),
  
  // Retry/Details
  retryCount: v.number(),
  payload: v.optional(v.any()),
  response: v.optional(v.string()),
  
  ...withTimestamps(),
})
  .index('by_user_and_type', ['userId', 'processType'])
  .index('by_status', ['status'])
  .index('by_processId', ['processId'])
```

**Code Updates Required:**

| File | Change | Before | After |
|------|--------|--------|-------|
| `convex/webhooks.ts` | Insert logic | `webhookExecutionLog` | `processLog` with processType="webhook" |
| `convex/reporting.ts` | Insert logic | `reportExecutions` | `processLog` with processType="report" |
| `convex/automation.ts` | Insert logic | `bulkOperationJobs` | `processLog` with processType="bulk_op" |
| Any query code | Query updates | Multiple table queries | Single query: processLog + filter by processType |
| Dashboard/logs page | Unified log viewer | Filter per table | Single processLog query |

**DELETE after migration:** webhookExecutionLog, reportExecutions, bulkOperationJobs, duplicateDetectionLog (move to separate decision table if needed)

---

### 2C. Consolidate Settings Tables (Part 1: User Preferences)

**Current (6 tables mixed):**
- `userSettings` — language, theme, timezone, notifications
- `notificationRules` — notification channels/triggers
- `insightSettings` — insight toggles + thresholds
- `dashboardWidgets` — widget layout per user
- Part of: `organizationSettings` (company settings mixed with company metadata)

**Target:** `userPreferences` (single per-user settings table)

**New Schema:**
```typescript
userPreferences: defineTable({
  userId: v.string(),
  
  // UI Preferences
  theme: v.optional(v.string()),       // "light", "dark", "system"
  language: v.optional(v.string()),    // "en", "ne", "hi"
  dateFormat: v.optional(v.string()),  // "DD/MM/YYYY", "MM/DD/YYYY"
  timeFormat: v.optional(v.string()),  // "12h", "24h"
  timezone: v.optional(v.string()),    // "Asia/Kathmandu"
  currencyCode: v.optional(v.string()), // "NPR", "USD"
  
  // Dashboard
  dashboardLayout: v.optional(v.string()), // "grid", "list"
  dashboardRefreshInterval: v.number(), // milliseconds
  dashboardWidgets: v.array(v.object({
    id: v.string(),
    type: v.string(),
    position: v.number(),
    size: v.string(),              // "small", "medium", "large"
    isVisible: v.boolean(),
    isLocked: v.optional(v.boolean()),
    config: v.optional(v.any()),
  })),
  
  // Notifications
  emailNotifications: v.boolean(),
  lowStockAlerts: v.boolean(),
  paymentAlerts: v.boolean(),
  notificationChannels: v.array(v.string()), // "email", "sms", "slack", "webhook"
  
  // Insights
  anomalyDetectionEnabled: v.boolean(),
  anomalyThreshold: v.number(),         // 0-100
  trendAnalysisEnabled: v.boolean(),
  dismissedInsights: v.array(v.string()), // insight IDs user dismissed
  
  ...withTimestamps(),
})
  .index('by_user', ['userId'])
```

**Code Updates Required:**

| File | Change | Queries Affected |
|------|--------|------------------|
| `convex/userSettings.ts` | Merge into `userPreferences.ts` | `getUserSettings` → `getUserPreferences` |
| `src/components/ThemeProvider.tsx` | Update query | From 4 queries → 1 unified query |
| `src/app/(main)/(authenticated)/settings/appearance` | Update form | Reference dashboardLayout, theme, language |
| `src/app/(main)/(authenticated)/settings/notifications` | Update form | Reference notification fields directly |
| Any dashboard code | Update query | Single source for widgets |

**DELETE after migration:** userSettings, notificationRules, insightSettings, dashboardWidgets

---

### 2D. Consolidate Settings Tables (Part 2: Organization Config)

**Current (4 tables):**
- `organizationSettings` (metadata + settings conflated)
- `integrations` — API integrations
- `apiKeys` — API access
- `webhooks` — Webhook endpoints
- `automationRules` — (stays separate, it's domain data)

**Target:** `organizationConfig` (organization-level settings + integrations)

**New Schema:**
```typescript
organizationConfig: defineTable({
  userId: v.string(),                 // Org owner
  
  // Company metadata (moved from organizationSettings)
  companyName: v.string(),
  businessType: v.string(),
  taxNumber: v.string(),
  // ... (see 2A, moved to `companies` table)
  
  // Integrations
  integrations: v.array(v.object({
    id: v.string(),                   // integration.id reference
    name: v.string(),                 // "Razorpay", "SendGrid"
    category: v.string(),             // "payment", "email", "sms"
    enabled: v.boolean(),
    lastSyncAt: v.optional(v.number()),
  })),
  
  // API Keys
  apiKeys: v.array(v.object({
    id: v.string(),
    name: v.string(),
    displayKey: v.string(),           // "sk_...xxxx" (masked)
    revoked: v.boolean(),
    expiresAt: v.optional(v.number()),
    lastUsedAt: v.optional(v.number()),
  })),
  
  // Webhooks
  webhooks: v.array(v.object({
    id: v.string(),
    url: v.string(),
    events: v.array(v.string()),
    isActive: v.boolean(),
    lastTriggeredAt: v.optional(v.number()),
    failureCount: v.number(),
  })),
  
  // Automation Rules (reference IDs only)
  automationRuleIds: v.array(v.string()), // Links to automationRules table
  
  ...withTimestamps(),
})
  .index('by_user', ['userId'])
```

**Keep as separate tables** (not embedded):
- `integrations` table (full config + secrets)
- `apiKeys` table (full keys + secrets)
- `webhooks` table (full webhook config)
- `automationRules` table (domain data, not config)

**Why separate?** Secrets should not be embedded. Query independently. Scale to 1000s.

**Code Updates Required:**

| File | Change | Impact |
|------|--------|--------|
| `convex/integrations.ts` | Update query pattern | Add organizationConfig lookup, store integration IDs |
| `convex/apiKeys.ts` | Update query pattern | Same as integrations |
| `src/features/settings/integrations/*` | Update UI queries | Reference organizationConfig + separate tables |
| Settings pages | Unified org config page | Dashboard for API keys, integrations, webhooks |

**DELETE after migration:** organizationSettings (metadata part; settings part → userPreferences)

---

### 2E. Receipt/Invoice/Expense Consolidation

**Current (Fragmented):**
- `expenses` table — has receiptUrl + receiptFileName (but separate table exists!)
- `expenseReceipts` — separate receipt metadata table (redundant!)
- `invoices` — B2B sales invoices with nested items
- `payments` — payment tracking with invoiceNumber (redundancy?)

**Problem:** 
- Should receipts live in expenses or separate?
- Should payments reference invoices or sales?
- Are invoices sales invoices only, or do expense receipts also count as "invoices"?

**Decision:** Clarify the model:

**Option A (Recommended):** Keep separate but clear roles

```typescript
// B2B/B2C Sales Invoices - formal documents with line items
invoices: defineTable({
  userId: v.string(),
  invoiceNumber: v.string(),
  // ... existing fields
  documentType: v.string(),   // "sales" | "purchase" (for clarity)
})

// Expense records with attached receipts
expenses: defineTable({
  userId: v.string(),
  // ... existing fields
  receiptUrl: v.optional(v.string()),     // KEEP inline
  receiptFileName: v.optional(v.string()),
  // DELETE separate expenseReceipts table
})

// DELETE:
// - expenseReceipts (merge into expenses)
// - reconciliationMatches (move to separate audit table if needed)
```

**Code Updates Required:**

| File | Change | Impact |
|------|--------|--------|
| `convex/expenses.ts` | Remove expenseReceipts queries | Delete `getExpenseReceipts`, etc. |
| `src/features/expenses/*` | Update upload logic | Save directly to expenses table |
| OCR processing | Update target | Save to expenses.ocrData instead of expenseReceipts.extractedData |
| Queries | Simplify | Join expenses + receipts → single query |

**DELETE after migration:** expenseReceipts table (consolidate into expenses)

---

### 2F. Location Reference Consistency

**Current (Inconsistent):**
- `stockMovements.locationId` — optional string (WRONG!)
- `sales.locationId` — optional v.id('locations') (CORRECT)
- `inventoryReconciliations.location` — string field (WRONG!)

**Target:** Use v.id('locations') everywhere

**Audit Checklist:**
- [ ] stockMovements.locationId — change from string to v.id('locations')
- [ ] inventoryReconciliations.location — change from string to v.id('locations')
- [ ] Any other table with location references — audit and standardize
- [ ] All queries — update to expect v.id('locations')

**Code Updates Required:**

| File | Change | Queries |
|------|--------|---------|
| `convex/schema.ts` | Update type definitions | Types exported to _generated/dataModel.ts |
| `convex/products.ts` | stockMovements queries | Update location filters |
| `convex/reporting.ts` | inventory reconciliation queries | Update location joins |
| `src/features/inventory/*` | Update form/display | Treat as ID references |
| `src/features/sales/*` | Update form/display | Treat as ID references |

---

## Phase 3: Migration & Testing

### 3A. Data Migration Script

**For each consolidation:**

```typescript
// Example: companyDetails + organizationSettings → companies
export const migrateCompanyData = mutation(async (ctx) => {
  const cd = await ctx.db.query('companyDetails').collect();
  const os = await ctx.db.query('organizationSettings').collect();
  
  for (const comp of cd) {
    await ctx.db.insert('companies', {
      userId: comp.userId,
      name: comp.companyName,
      address: comp.companyAddress,
      // ... map all fields
      type: 'company',
      isDeleted: comp.isDeleted,
      createdAt: comp.createdAt,
      updatedAt: comp.updatedAt,
    });
  }
  
  for (const org of os) {
    // Merge with existing or create new
    await ctx.db.insert('companies', {
      userId: org.userId,
      name: org.companyName,
      // ... map all fields
      type: 'company',
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    });
  }
  
  return { migratedCount: cd.length + os.length };
});
```

### 3B. Query Tests

**Before deletion, verify:**
- [ ] All reads work with new table
- [ ] All writes work with new table
- [ ] Soft-delete logic still works
- [ ] Indexes are used (check Convex dashboard)
- [ ] No stale code queries old table

---

## Implementation Timeline

| Phase | Tables | Effort | Duration |
|-------|--------|--------|----------|
| 1 | Helpers setup | Low | 1 session ✅ |
| 2A | companies (3→1) | Medium | 2 sessions |
| 2B | processLog (8→2) | Medium | 2 sessions |
| 2C | userPreferences (4→1) | Medium | 2 sessions |
| 2D | organizationConfig (4 separate) | Low | 1 session |
| 2E | expenses consolidation (2→1) | Low | 1 session |
| 2F | location refs | Low | 1 session |
| 3 | Migration + testing | High | 2 sessions |

**Total:** ~12 sessions (6-8 hours)

---

## Checklist for Each Consolidation

- [ ] New schema defined + tested locally
- [ ] Migration script written + tested
- [ ] All code files updated (mutations, queries, UI)
- [ ] Tests pass (grep for old table references)
- [ ] Indexes verified in Convex dashboard
- [ ] Deployment checklist reviewed
- [ ] Old table marked as deprecated (2-week grace period)
- [ ] Old table deleted after verification

---

## Success Metrics

**Before:**
- 67 tables
- ~100+ lines of boilerplate (soft-delete patterns)
- 8 separate log tables
- 10 settings/config tables

**After:**
- 50 tables (25% reduction)
- ~0 boilerplate (extracted to helpers)
- 2 log tables (unified)
- 3 settings/config tables (clear roles)
- **Better:** Maintainability, consistency, code clarity

---

## References

- Schema helpers: `convex/lib/schemaHelpers.ts`
- Current schema: `convex/schema.ts`
- Related docs: `Documentation/reference/DATABASE-SCHEMA.md`
- Update PROJECT_CONTEXT.md after completion
