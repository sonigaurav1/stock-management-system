# Admin Dashboard Implementation Guide

## 📋 Current Status

✅ **Completed**:

- 7 Enterprise Dashboard Components Created
- Main Admin Page with 8-tab navigation
- Convex API functions (structured with mock data)
- React hooks for data fetching
- Beautiful UI with Recharts analytics

⏳ **Next Steps**:

1. Connect Convex backend
2. Replace mock data with real database queries
3. Implement CRUD operations
4. Test the dashboard
5. Deploy and monitor

---

## 🔗 Step 1: Connect Convex Backend

### Files to Update

**Location**: `convex/admin.ts`

Replace TODO comments with actual database queries. Example:

```typescript
// BEFORE (Mock Data)
export const getTeamMembers = query({
  handler: async (ctx, { role }) => {
    return [{ id: '1', name: 'Sarah Johnson', ... }];
  }
});

// AFTER (Real Data)
export const getTeamMembers = query({
  handler: async (ctx, { role }) => {
    let members = await ctx.db.query('users').collect();
    if (role) {
      members = members.filter(m => m.role === role);
    }
    return members;
  }
});
```

### Key Database Tables Needed

```typescript
// Users/Team Table
export const users = defineTable({
  userId: v.string(),
  name: v.string(),
  email: v.string(),
  role: v.string(), // 'owner', 'admin', 'manager', 'staff', 'viewer'
  department: v.string(),
  status: v.string(), // 'active', 'inactive', 'pending'
  joinedDate: v.number(),
  lastActive: v.number()
})
  .index('by_role', ['role'])
  .index('by_status', ['status']);

// Audit Logs Table
export const auditLogs = defineTable({
  userId: v.string(),
  user: v.string(),
  email: v.string(),
  action: v.string(),
  category: v.string(), // 'user', 'system', 'data', 'security', 'billing'
  resource: v.string(),
  details: v.string(),
  status: v.string(), // 'success', 'failure', 'warning'
  ipAddress: v.string(),
  timestamp: v.number()
})
  .index('by_category', ['category'])
  .index('by_status', ['status'])
  .index('by_timestamp', ['timestamp']);

// Company Details Table
export const company = defineTable({
  organizationId: v.string(),
  companyName: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  taxNumber: v.string(),
  status: v.string(),
  createdAt: v.number(),
  updatedAt: v.number()
});

// System Settings Table
export const settings = defineTable({
  organizationId: v.string(),
  timezone: v.string(),
  language: v.string(),
  features: v.object({
    advancedReporting: v.boolean(),
    multiTenancy: v.boolean(),
    apiAccess: v.boolean(),
    webhooks: v.boolean()
  }),
  security: v.object({
    twoFactorAuth: v.boolean(),
    sessionTimeout: v.number(),
    passwordMinLength: v.number()
  })
});

// Analytics Data Table (for caching)
export const analytics = defineTable({
  organizationId: v.string(),
  period: v.string(), // 'daily', 'weekly', 'monthly'
  revenue: v.number(),
  orders: v.number(),
  customers: v.number(),
  date: v.number()
})
  .index('by_period', ['period'])
  .index('by_date', ['date']);

// Exports Table
export const exports = defineTable({
  userId: v.string(),
  dataType: v.string(),
  format: v.string(),
  fileName: v.string(),
  fileSize: v.number(),
  status: v.string(), // 'pending', 'ready', 'failed'
  createdAt: v.number(),
  expiresAt: v.number()
})
  .index('by_userId', ['userId'])
  .index('by_status', ['status']);
```

---

## 🪝 Step 2: Use Hooks in Components

### Example: Connect KPI Dashboard

**File**: `src/features/admin/components/EnterpriseKPIDashboard.tsx`

```typescript
'use client';

import { useKPIMetrics } from '@/hooks/useAdminDashboard';

export function EnterpriseKPIDashboard() {
  const kpiData = useKPIMetrics();

  if (!kpiData) {
    return <div>Loading KPI data...</div>;
  }

  // Now use kpiData instead of mock data
  const kpiMetrics = [
    {
      title: 'Total Revenue',
      value: kpiData.revenue.value,
      change: kpiData.revenue.change,
      trend: kpiData.revenue.trend,
      // ... rest of properties
    },
    // ... other metrics
  ];

  return (
    // ... render UI with real data
  );
}
```

### Example: Connect Team Management

**File**: `src/features/admin/components/EnterpriseTeamManagement.tsx`

```typescript
'use client';

import {
  useTeamMembers,
  useInviteTeamMember,
  useRemoveTeamMember
} from '@/hooks/useAdminDashboard';

export function EnterpriseTeamManagement() {
  const teamMembers = useTeamMembers(); // Real data
  const inviteMember = useInviteTeamMember();
  const removeMember = useRemoveTeamMember();

  const handleInvite = async (email: string, role: string) => {
    try {
      await inviteMember({ email, role, department: 'Sales' });
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeMember({ userId });
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  return (
    // ... render with real data and handlers
  );
}
```

---

## 🔍 Step 3: Add Error Handling & Loading States

### Pattern for Components

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function MyComponent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const data = useQuery(api.admin.getAnalyticsData, {});
  const updateData = useMutation(api.admin.updateSystemSettings);

  const handleUpdate = async (newValue) => {
    setIsLoading(true);
    try {
      await updateData({ setting: 'timezone', value: newValue });
      toast({
        title: 'Success',
        description: 'Settings updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!data) {
    return <div className='flex items-center justify-center h-64'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
    </div>;
  }

  return (
    <Card>
      <CardContent className='pt-6'>
        {/* Render data */}
        <Button
          onClick={() => handleUpdate('UTC')}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 📝 Step 4: Audit Logging Pattern

Whenever admin takes an action, log it:

```typescript
// Helper function
export async function logAdminAction(
  ctx,
  user: User,
  action: string,
  category: string,
  resource: string,
  details: string = '',
  status: 'success' | 'failure' | 'warning' = 'success'
) {
  const ipAddress = ctx.request?.headers.get('x-forwarded-for') || 'unknown';

  await ctx.db.insert('auditLogs', {
    userId: user.id,
    user: user.name,
    email: user.email,
    action,
    category,
    resource,
    details,
    status,
    ipAddress,
    timestamp: Date.now()
  });
}

// Usage in mutations
export const updateTeamMemberRole = mutation({
  args: { userId: v.string(), newRole: v.string() },
  handler: async (ctx, { userId, newRole }) => {
    const user = await checkAdminAccess(ctx);

    // Update role
    const targetUser = await ctx.db.get(userId);
    await ctx.db.patch(userId, { role: newRole });

    // Log action
    await logAdminAction(
      ctx,
      user,
      'Role Updated',
      'user',
      `User #${userId}`,
      `Role changed from ${targetUser.role} to ${newRole}`,
      'success'
    );

    return { success: true };
  }
});
```

---

## 🧪 Step 5: Testing the Dashboard

### Manual Testing Checklist

- [ ] Navigate to `/admin`
- [ ] Verify admin-only access (test with non-admin user)
- [ ] Dashboard tab loads KPI cards
- [ ] Analytics tab displays charts correctly
- [ ] Team tab shows team members
- [ ] Can invite new team member
- [ ] Audit tab displays logs
- [ ] Export functionality works
- [ ] Settings save without errors
- [ ] Dark mode works in all tabs

### Performance Testing

```typescript
// Log performance metrics
console.time('analytics-load');
const analytics = useAnalyticsData();
console.timeEnd('analytics-load');

// Monitor bundle size
// npm run build
// Check .next/static folder
```

---

## 🚀 Step 6: Optimization Tips

### 1. Data Caching Strategy

```typescript
// Cache analytics for 5 minutes
export const getAnalyticsData = query({
  handler: async (ctx) => {
    const cached = await ctx.db
      .query('analyticsCache')
      .filter((c) => c.expiresAt > Date.now())
      .first();

    if (cached) return cached.data;

    // If not cached, calculate
    const data = calculateAnalytics();

    // Store cache
    await ctx.db.insert('analyticsCache', {
      data,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    return data;
  }
});
```

### 2. Pagination for Large Datasets

```typescript
export const getAuditLogs = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.number()
  },
  handler: async (ctx, { cursor, limit }) => {
    let query = ctx.db.query('auditLogs').order('desc');

    if (cursor) {
      query = query.filter((l) => l._id < cursor);
    }

    const logs = await query.take(limit + 1);
    const hasMore = logs.length > limit;

    return {
      logs: logs.slice(0, limit),
      cursor: logs.length > 0 ? logs[logs.length - 1]._id : null,
      hasMore
    };
  }
});
```

### 3. Lazy Loading Tabs

```typescript
// Only load tab content when clicked
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
        <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        {/* ... */}
      </TabsList>

      {activeTab === 'dashboard' && <EnterpriseKPIDashboard />}
      {activeTab === 'analytics' && <EnterpriseAnalyticsDashboard />}
      {/* ... */}
    </Tabs>
  );
}
```

---

## 📊 Step 7: Monitoring & Analytics

Add performance monitoring:

```typescript
// src/lib/monitoring.ts
export function trackAdminAction(action: string, duration: number) {
  // Send to analytics service
  analytics.track('admin_action', {
    action,
    duration,
    timestamp: new Date()
  });
}

// Usage
console.time('export-data');
await exportData();
const duration = console.timeEnd('export-data');
trackAdminAction('data-export', duration);
```

---

## 🛠️ Quick Reference: Hook Usage

```typescript
// Fetching Data
const kpis = useKPIMetrics();
const team = useTeamMembers();
const logs = useAuditLogs();
const company = useCompanyDetails();
const settings = useSystemSettings();

// Mutating Data
const inviteMember = useInviteTeamMember();
const updateRole = useUpdateTeamMemberRole();
const removeMember = useRemoveTeamMember();
const updateSettings = useUpdateSystemSettings();
const exportData = useExportData();
const generateReport = useGenerateReport();

// Usage Pattern
const handleAction = async () => {
  try {
    await mutation({ arg1: value1, arg2: value2 });
    toast.success('Action completed');
  } catch (error) {
    toast.error('Action failed: ' + error.message);
  }
};
```

---

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex React Hooks](https://docs.convex.dev/clients/react)
- [Convex Authentication](https://docs.convex.dev/auth)
- [ENTERPRISE_ADMIN_GUIDE.md](./ENTERPRISE_ADMIN_GUIDE.md) - Feature documentation

---

## 🎯 Success Criteria

✅ All dashboard sections load without errors  
✅ Real data displays instead of mock data  
✅ Admin actions are logged to audit trail  
✅ Team management CRUD fully functional  
✅ Exports and reports generate successfully  
✅ Dashboard loads in < 2 seconds  
✅ Works on mobile and desktop  
✅ Dark mode fully supported  
✅ All TypeScript types are strict  
✅ No console errors or warnings

---

**Next Command**: Start implementing the Convex functions with real database queries!
