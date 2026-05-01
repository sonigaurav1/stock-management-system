# Phase 2C - Settings Tables Consolidation Plan

## Overview
Consolidate 5 settings-related tables into a unified settings architecture while addressing missing module implementations.

## Current State (10 Settings Tables)

### Active Tables (with Convex modules)
1. **userSettings** - User preferences (language, currency, dateFormat)
2. **organizationSettings** - Organization defaults (consolidating in Phase 2A)
3. **notificationPreferences** - Notification channels and triggers
4. **insightSettings** - Analytics/insights configuration
5. **dashboardWidgets** - Dashboard widget configuration
6. **integrations** - Third-party integrations

### Orphaned Tables (NO Convex modules - CRITICAL)
1. **apiKeys** ⚠️ - API key management (frontend page exists, no backend)
2. **webhooks** ⚠️ - Webhook configuration (frontend page exists, no backend)
3. **notificationRules** ⚠️ - Notification routing rules (partial implementation)
4. **automationRules** ⚠️ - Automation configuration (no module)

## Phase 2C Strategy

### 2C.1: Create Missing Modules (CRITICAL - Priority)
- [ ] Create convex/apiKeys.ts module
- [ ] Create convex/webhooks.ts module (if separate needed)
- [ ] Complete notificationRules implementation
- [ ] Complete automationRules implementation
- **Estimated**: 4-6 hours

### 2C.2: Settings Consolidation
Transform 5 active settings tables into unified `appSettings` table:

**Consolidation Map**:
```
userSettings ──┐
               ├─→ appSettings (type field)
organizationSettings ──┤
notificationPreferences ──┤
insightSettings ──┤
dashboardWidgets ──┘
```

**New unified table structure**:
```typescript
appSettings: defineTable({
  userId: v.string(),
  type: v.string(), // "user" | "organization" | "notifications" | "insights" | "dashboard"
  settingsData: v.any(), // All type-specific data
  
  // Common fields
  createdAt: v.number(),
  updatedAt: v.number(),
  isDeleted: v.boolean()
}).index('by_user_and_type', ['userId', 'type'])
```

**Type-specific structures**:
- **user**: { language, currency, dateFormat, timezone, theme, ... }
- **organization**: { name, businessType, email, phone, ... }
- **notifications**: { channels, triggers, recipientMap, ... }
- **insights**: { enableAnomalyDetection, lowStockThreshold, ... }
- **dashboard**: { widgets: [], layout, refreshInterval, ... }

**Estimated**: 8-12 hours

### 2C.3: Frontend Updates
Update all settings pages to use new unified API:
- [ ] Update /settings/profile
- [ ] Update /settings/organization
- [ ] Update /settings/notifications
- [ ] Update /settings/insights
- [ ] Update dashboard configuration pages
- **Estimated**: 4-6 hours

### 2C.4: Testing & Cleanup
- [ ] TypeScript compilation
- [ ] Backend testing
- [ ] Frontend testing
- [ ] Data migration (optional)
- [ ] Remove deprecated tables
- **Estimated**: 2-3 hours

## Benefits of Phase 2C

✅ **Schema Simplification**
- 10 settings tables → 1 unified appSettings table
- 90% reduction in settings-related tables
- Better maintenance and discoverability

✅ **Single Source of Truth**
- All user/organization settings in one place
- Consistent CRUD API for all setting types
- Easier permission management

✅ **Missing Module Implementation**
- Complete apiKeys management
- Complete webhooks configuration
- Full notificationRules workflow
- Proper automationRules setup

✅ **Performance**
- Fewer table scans
- Unified query patterns
- Better index utilization

## Implementation Notes

### Critical Path (Phase 2C.1 + 2C.2)
1. Create missing modules first (apiKeys, webhooks)
2. Add appSettings table to schema
3. Create unified settings.ts module
4. Update existing modules to use appSettings
5. Verify TypeScript compilation
6. **Total**: 12-18 hours

### Recommended Rollout
- **Week 1**: Phase 2C.1 (missing modules) + Planning
- **Week 2**: Phase 2C.2 (schema & backend)
- **Week 3**: Phase 2C.3 (frontend) + Testing
- **Week 4**: Phase 2C.4 (cleanup & deployment)

## Risk Mitigation

### Phase 2C.1 (Creating missing modules)
- **Risk**: Might break existing frontend pages that expect these
- **Mitigation**: Check current frontend to see if these tables are referenced
- **Workaround**: Create minimal modules first, extend later

### Phase 2C.2 (Consolidation)
- **Risk**: Complex queries might become slower
- **Mitigation**: Add proper indexes and test performance
- **Workaround**: Use type-specific queries to narrow results

### Phase 2C.3 (Frontend updates)
- **Risk**: Many pages need updating
- **Mitigation**: Reusable hook for settings queries
- **Workaround**: Gradual rollout (one page at a time)

## Timeline Estimate

| Phase | Duration | Owner |
|-------|----------|-------|
| 2C.1 - Missing modules | 4-6 hours | AI Agent |
| 2C.2 - Consolidation | 8-12 hours | AI Agent |
| 2C.3 - Frontend | 4-6 hours | AI Agent |
| 2C.4 - Testing | 2-3 hours | QA/Manual |
| **Total** | **18-27 hours** | Distributed |

## Success Criteria

- ✅ All missing modules implemented
- ✅ Schema consolidation complete
- ✅ TypeScript compilation passes
- ✅ All settings pages functional
- ✅ API queries perform well
- ✅ No data loss during migration
- ✅ Backward compatibility maintained (2-week grace period)

## Documentation Needed

### During Implementation
- [ ] PHASE-2C-MIGRATION-GUIDE.md
- [ ] PHASE-2C-API-REFERENCE.md
- [ ] Updated DATABASE-SCHEMA.md

### After Completion
- [ ] PHASE-2C-COMPLETION-SUMMARY.md
- [ ] Settings module documentation
- [ ] Frontend settings hooks documentation

## Related Phases

**Already Completed**:
- ✅ Phase 2A - Company metadata consolidation (3 tables → 1)
- ✅ Phase 2B - Log consolidation (8 tables → 3)

**Phase 2C - Settings consolidation (10 tables → 1)**

**Future**:
- Phase 2D - Additional optimizations
- Phase 3 - Feature enhancements

## Rollback Plan

If consolidation causes issues:
1. Keep old settings tables in schema
2. Maintain dual-write during transition
3. Revert frontend to query old tables if needed
4. Keep appSettings table marked as beta
5. Re-plan for next sprint

## Next Steps

1. ✅ Approve Phase 2C.1 (missing modules implementation)
2. ✅ Review SETTINGS-TABLES-ANALYSIS.md for detailed data
3. ⏳ Schedule Phase 2C.2 after Phase 2C.1 approval
4. ⏳ Plan Phase 2C.3 after 2C.2 completion
5. ⏳ Execute Phase 2C.4 with full testing

---

**Status**: Plan Ready
**Prerequisite**: Phase 2B Complete ✅
**Ready for**: Implementation
**Complexity**: High (many interdependencies)
**Estimated Duration**: 3-4 weeks
