# Phase 2B - Log Tables Consolidation Plan

## Overview
Consolidate 8 log-related tables into 3 unified tables to reduce schema complexity, improve performance, and provide better cross-domain event correlation.

## Current State (8 Tables)
1. **auditLog** - User actions, team changes ✅ ACTIVE (14 inserts/month)
2. **webhookExecutionLog** - Webhook executions ❌ UNUSED (test only)
3. **duplicateDetectionLog** - Duplicate detection ✅ ACTIVE (1 insert/month)
4. **featureUsage** - Feature analytics ❌ UNUSED (test only)
5. **bulkOperationJobs** - Batch operations history (embedded)
6. **discountAudit** - Discount approvals (embedded)
7. **transactionCategoryMappings** - AI categorization (embedded)
8. **priceChangeRequests** - Price change workflow (embedded)

## Target State (3 Tables)

### 1. **auditLog** (renamed → userAuditLog)
- **Consolidates**: Audit trail, team changes, discount approvals, price changes
- **Schema**: Keep existing with enhancement
- **Type field values**: "user_action" | "team_change" | "discount_approval" | "price_change"
- **Current inserts**: 14/month → 18/month (after consolidation)

### 2. **systemLog** (NEW)
- **Consolidates**: webhookExecutionLog + duplicateDetectionLog
- **Fields**:
  - userId, logType, status, timestamp
  - type: "webhook" | "duplicate_detection" | "bulk_operation" | "report"
  - Additional fields based on type
- **Purpose**: Background job tracking, system-level events

### 3. **featureUsage** (unchanged)
- **Purpose**: Feature adoption analytics
- **Status**: Keep separate (analytics/telemetry)

## Migration Strategy

### Phase 2B.1 - Schema Changes
- [ ] Add `systemLog` table to convex/schema.ts
- [ ] Update indexes on auditLog to support new usage patterns
- [ ] Keep old tables for 2-week grace period

### Phase 2B.2 - Backend Module Updates
- [ ] Create convex/logs.ts module with unified API
- [ ] Update convex/compliance.ts to use new systemLog
- [ ] Update convex/automation.ts to use new systemLog
- [ ] Update convex/tests.ts to use new systemLog
- [ ] Deprecate/remove old module references

### Phase 2B.3 - Frontend Updates
- [ ] Connect EnterpriseAuditLogs to actual backend API (currently mock)
- [ ] Update AuditTrailWidget if needed
- [ ] Add system logs display panel

### Phase 2B.4 - Testing & Cleanup
- [ ] Run TypeScript compilation
- [ ] Test audit log queries
- [ ] Test system log queries
- [ ] Data migration (optional)
- [ ] Remove deprecated tables

## Implementation Order
1. Create systemLog table definition
2. Create logs.ts module
3. Update compliance.ts to write to systemLog
4. Update automation.ts to write to systemLog
5. Update tests.ts to write to systemLog
6. Update users.ts statistics
7. Verify TypeScript compilation
8. Connect frontend components
9. Document changes

## Benefits
- ✅ 62% table reduction (8 → 3)
- ✅ Unified event logging
- ✅ Better correlation between system events
- ✅ Improved maintainability
- ✅ Cross-domain event querying

## Timeline
- **Phase 2B.1**: Schema changes (1 hour)
- **Phase 2B.2**: Backend updates (2 hours)
- **Phase 2B.3**: Frontend updates (1 hour)
- **Phase 2B.4**: Testing & cleanup (1 hour)
- **Total**: ~5 hours

## Rollback Plan
- Keep old tables for 2 weeks
- Dual-write during transition period (optional)
- Revert schema.ts if issues found
- Convex codegen once reverted
