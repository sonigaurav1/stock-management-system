# Testing "Key Metrics" Dashboard Data

Complete guide for testing dashboard metrics with demo data injection.

---

## 🎯 Overview

The `/dashboard/overview` page displays Key Metrics using Convex queries:
- **Customer Count** - Active customers & month-over-month change
- **Revenue Summary** - Total revenue & comparison
- **Product Inventory** - Stock levels & trends
- **Sales Performance** - Sales data & analytics

---

## 🛠️ Testing Approaches

### ✅ Recommended: Demo Data Seeder Page (Suggested)

**Best for:** Full-featured testing with realistic data

**Pros:**
- ✅ No authentication required (dev environment)
- ✅ Inject any amount of demo data
- ✅ Create specific scenarios (e.g., "no sales last month")
- ✅ Reset/clear data easily
- ✅ Test UI with actual data volume
- ✅ Test edge cases (empty metrics, high values)

**Cons:**
- ⚠️ Only works in development mode
- ⚠️ Need to manually create data

**How it works:**
1. Create a page at `src/app/(dev-tools)/demo-data/page.tsx`
2. Add Convex mutations to create sample data
3. Access without authentication (dev-only)
4. Inject data and test dashboard

---

### Alternative: Convex Dashboard Data Browser

**Best for:** Quick inspection & validation

**Pros:**
- ✅ Visual inspection of data
- ✅ Built-in to Convex
- ✅ No code required

**Cons:**
- ⚠️ Manual data creation is tedious
- ⚠️ Can't easily create relationships
- ⚠️ Limited scenario creation

**Access:** Go to Convex Dashboard > Data Browser

---

### Alternative: Unit/Integration Tests

**Best for:** Automation & regression testing

**Pros:**
- ✅ Automated, repeatable
- ✅ CI/CD integration
- ✅ Good for regression
- ✅ No manual work

**Cons:**
- ⚠️ Doesn't test UI rendering
- ⚠️ Need to set up testing infrastructure
- ⚠️ More setup time

---

## 📋 What to Test

### Key Metrics Data Points

| Metric | Tests | Edge Cases |
|--------|-------|-----------|
| **Active Customers** | Count accuracy, month change | 0 customers, high volume |
| **Revenue** | Calculation, currency format | $0, negative (refunds), >$1M |
| **Product Stock** | Inventory levels, categories | Out of stock, overstock |
| **Sales Trend** | Chart data, comparison | No sales, seasonal spikes |

### UI Rendering Tests
- [ ] Loading skeletons appear
- [ ] Metric values display correctly
- [ ] Percentage changes show (+/-) correctly
- [ ] Colors change based on positive/negative
- [ ] Charts render with data
- [ ] Empty states handle null/undefined

---

## 🚀 Recommended Setup: Demo Data Seeder

### Step 1: Create Demo Data Seeder Page

```typescript
// src/app/(dev-tools)/demo-data/page.tsx
'use client';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import NotFound from '@/app/not-found';
import { toast } from 'sonner';
import { useState } from 'react';

export default function DemoDataPage() {
  if (process.env.NODE_ENV === 'production') {
    return <NotFound />;
  }

  const createDemoData = useMutation(api.admin.createDemoDashboardData);
  const clearDemoData = useMutation(api.admin.clearDemoDashboardData);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleCreateData = async () => {
    setIsLoading(true);
    try {
      await createDemoData({
        customerCount: 150,
        revenueAmount: 125000,
        productCount: 45,
        salesRecords: 120
      });
      toast.success('Demo data created successfully!');
    } catch (error) {
      toast.error('Failed to create demo data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearDemoData({});
      toast.success('Demo data cleared!');
    } catch (error) {
      toast.error('Failed to clear demo data');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Demo Data Seeder</h1>
          <p className="text-muted-foreground mt-2">
            Inject demo data for testing dashboard metrics (Dev Only)
          </p>
        </div>

        <div className="grid gap-4">
          {/* Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>Test Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scenario buttons */}
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button 
                onClick={handleCreateData}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Demo Data'}
              </Button>
              <Button 
                onClick={handleClearData}
                variant="destructive"
                disabled={isClearing}
              >
                {isClearing ? 'Clearing...' : 'Clear All Demo Data'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
```

### Step 2: Create Convex Mutation for Demo Data

```typescript
// convex/admin.ts (add these functions)

export const createDemoDashboardData = mutation({
  args: {
    customerCount: v.number(),
    revenueAmount: v.number(),
    productCount: v.number(),
    salesRecords: v.number()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const userId = identity.subject;
    
    // Create sample customers
    for (let i = 0; i < args.customerCount; i++) {
      await ctx.db.insert('customers', {
        userId,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@demo.com`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        isDeleted: false
      });
    }

    // Create sample products
    for (let i = 0; i < args.productCount; i++) {
      await ctx.db.insert('products', {
        userId,
        name: `Product ${i + 1}`,
        sku: `SKU-${i + 1}`,
        quantity: Math.floor(Math.random() * 100),
        price: Math.random() * 1000,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        isDeleted: false
      });
    }

    // Create sample sales records
    for (let i = 0; i < args.salesRecords; i++) {
      await ctx.db.insert('sales', {
        userId,
        amount: Math.random() * 1000 + 100,
        quantity: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        isDeleted: false
      });
    }

    return { success: true, created: args };
  }
});

export const clearDemoDashboardData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const userId = identity.subject;

    // Delete demo data
    const customers = await ctx.db
      .query('customers')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();
    
    for (const customer of customers) {
      await ctx.db.delete(customer._id);
    }

    // ... repeat for products, sales, etc.

    return { success: true, deleted: customers.length };
  }
});
```

---

## 📊 Test Scenarios

### Scenario 1: Normal Data
- 150 customers
- $125,000 revenue
- 45 products
- 120 sales records

### Scenario 2: Growing Trend
- Month 1: 100 customers → Month 2: 150 customers (+50%)
- Month 1: $80,000 → Month 2: $120,000 (+50%)

### Scenario 3: Declining Trend
- Month 1: 150 customers → Month 2: 100 customers (-33%)
- Month 1: $120,000 → Month 2: $80,000 (-33%)

### Scenario 4: Edge Cases
- 0 customers (empty state)
- 0 revenue
- Huge values ($10M+)
- Missing data (null values)

---

## 🧪 Manual Testing Checklist

### Before Dashboard Testing
- [ ] No authentication required on dev pages
- [ ] Demo data page loads without errors
- [ ] Can create demo data without crashes
- [ ] Data appears in Convex dashboard

### Dashboard Metrics Rendering
- [ ] Customer count displays correctly
- [ ] Revenue shows proper formatting ($X,XXX)
- [ ] Month-over-month change shows +/- indicator
- [ ] Colors change (green for +, red for -)
- [ ] Percentage changes calculate correctly

### Edge Cases
- [ ] Empty state (0 metrics) displays gracefully
- [ ] High values (>$1M) format correctly
- [ ] Negative values show red color
- [ ] Loading skeletons appear during fetch
- [ ] Charts render with enough data points

### Data Accuracy
- [ ] Metric values match database
- [ ] Comparisons calculate correctly
- [ ] Timestamps are accurate
- [ ] User isolation works (only see own data)

---

## 🔍 Debugging Tips

### Check Database Data
1. Go to Convex Dashboard
2. Navigate to Data Browser
3. Select table (customers, sales, products)
4. Verify counts and values

### Check Query Results
```typescript
// In browser console, log query results
const result = useQuery(api.analytics.getTotalCustomersWithComparison, {});
console.log('Query result:', result);
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Look for Convex API calls
4. Check response data

---

## ✅ Benefits of Demo Seeder Approach

✅ **No Authentication Friction** - Dev-only, no auth needed  
✅ **Flexible Data** - Create any scenario  
✅ **Repeatable** - Reset and test multiple times  
✅ **Realistic Volume** - Test with 100+ records  
✅ **Edge Case Testing** - Test empty states, high values  
✅ **Quick Feedback** - See results immediately  
✅ **Shareable** - Other team members can use  

---

## 🚀 Next Steps

1. **Create the demo seeder page** - `src/app/(dev-tools)/demo-data/page.tsx`
2. **Add Convex mutations** - `createDemoDashboardData`, `clearDemoDashboardData`
3. **Create test scenarios** - Normal, growing, declining, edge cases
4. **Document findings** - Note any data issues or edge cases
5. **Update dashboard if needed** - Handle edge cases found

---

## 📝 Notes

- ⚠️ Demo pages only work in **development mode** (`NODE_ENV === 'development'`)
- ⚠️ Production returns `<NotFound />`
- ⚠️ Don't use real user IDs for demo data
- ✅ Use Clerk test users for authentication
- ✅ Clear demo data before testing with production users

---

**For more info:**
- Convex docs: https://docs.convex.dev
- Dashboard testing: Documentation/testing/DASHBOARD_TESTING.md
- Convex mutations: reference/API-GUIDE.md

