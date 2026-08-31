# Dashboard Metrics Testing - Implementation Guide

Step-by-step guide to set up and use the demo data seeder.

---

## ✅ What's Already Done

- ✅ Demo data seeder UI page created: `src/app/(dev-tools)/demo-data/page.tsx`
- ✅ Testing guide created: `TESTING_DASHBOARD_METRICS.md`
- ✅ 5 test scenarios ready: Normal, Growth, Decline, Empty, Large Scale
- ✅ Beautiful UI with scenario cards, controls, and verification guide

---

## 🔧 Implementation Steps

### Step 1: Add Convex Mutations

Add these mutations to `convex/admin.ts`:

```typescript
// convex/admin.ts

// Create demo data for testing
export const createDemoDashboardData = mutation({
  args: {
    customerCount: v.number(),
    lastMonthCustomerCount: v.optional(v.number()),
    revenueAmount: v.number(),
    lastMonthRevenue: v.optional(v.number()),
    productCount: v.number(),
    salesRecords: v.number(),
    scenarioName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const userId = identity.subject;
    const now = new Date();

    // Create sample customers
    for (let i = 0; i < args.customerCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      await ctx.db.insert('customers', {
        userId,
        name: `Demo Customer ${i + 1}`,
        email: `demo${i + 1}@example.com`,
        phone: `555-${String(i).padStart(4, '0')}`,
        address: `${i} Demo Street`,
        createdAt,
        isDeleted: false
      });
    }

    // Create sample products
    for (let i = 0; i < args.productCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      await ctx.db.insert('products', {
        userId,
        name: `Demo Product ${i + 1}`,
        sku: `DEMO-SKU-${String(i + 1).padStart(5, '0')}`,
        quantity: Math.floor(Math.random() * 500),
        price: (Math.random() * 1000 + 10).toFixed(2),
        category: ['Electronics', 'Clothing', 'Food', 'Books'][i % 4],
        createdAt,
        isDeleted: false
      });
    }

    // Create sample sales records
    for (let i = 0; i < args.salesRecords; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const amount = Math.random() * (args.revenueAmount / args.salesRecords);

      await ctx.db.insert('sales', {
        userId,
        amount: amount.toFixed(2),
        quantity: Math.floor(Math.random() * 20) + 1,
        status: ['completed', 'pending'][Math.random() > 0.8 ? 1 : 0],
        createdAt,
        isDeleted: false
      });
    }

    return {
      success: true,
      scenario: args.scenarioName || 'Unknown',
      created: {
        customers: args.customerCount,
        products: args.productCount,
        sales: args.salesRecords
      }
    };
  }
});

// Clear demo data
export const clearDemoDashboardData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const userId = identity.subject;
    let deletedCount = 0;

    // Delete customers
    const customers = await ctx.db
      .query('customers')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();
    for (const customer of customers) {
      await ctx.db.delete(customer._id);
      deletedCount++;
    }

    // Delete products
    const products = await ctx.db
      .query('products')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
      deletedCount++;
    }

    // Delete sales
    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();
    for (const sale of sales) {
      await ctx.db.delete(sale._id);
      deletedCount++;
    }

    return {
      success: true,
      deletedCount
    };
  }
});
```

### Step 2: Run Codegen

After adding mutations, run:

```bash
npx convex codegen
```

This generates the types in `convex/_generated/api.ts`

### Step 3: Verify Files Created

```bash
# Check demo data page exists
ls -la src/app/'(dev-tools)'/demo-data/page.tsx

# Check testing guide exists
ls -la TESTING_DASHBOARD_METRICS.md
```

### Step 4: Start Development Server

```bash
# In one terminal
pnpm run convex

# In another terminal
pnpm run dev
```

### Step 5: Access Demo Data Seeder

Open your browser: **http://localhost:3000/demo-data**

You should see:
- ✅ Dashboard Demo Data Seeder heading
- ✅ 5 test scenario cards
- ✅ Create Data buttons
- ✅ Clear All Data button

---

## 🧪 Testing Workflow

### Create Demo Data

1. Go to **http://localhost:3000/demo-data**
2. Click "Create Demo Data" on "Normal Data" scenario
3. Wait for success toast
4. Go to **http://localhost:3000/dashboard/overview**
5. Verify metrics display:
   - ✅ Customer Count: 150
   - ✅ Revenue: $125,000
   - ✅ Products visible
   - ✅ Charts render

### Test Growth Scenario

1. Go back to **http://localhost:3000/demo-data**
2. Click "Clear All Demo Data"
3. Click "Create Demo Data" on "Growth Trend"
4. Go to dashboard and verify:
   - ✅ Customers: 300 (higher)
   - ✅ Revenue: $180,000 (higher)
   - ✅ Percentage change: +50% (green)

### Test Edge Cases

1. "Empty State" - Test with 0 data
   - Verify no errors
   - Check graceful empty display

2. "Large Scale" - Test with 5000+ records
   - Verify charts still render
   - Check formatting of large numbers

### Verify in Convex

1. Open [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to **Data Browser**
4. Check tables:
   - customers: should have X records
   - products: should have X records
   - sales: should have X records

---

## 📊 Expected Results

### Normal Data Scenario
```
Customers:     150
Revenue:       $125,000
Products:      45
Sales:         120
```

### Dashboard Display
- Customer count badge: **150**
- Month change: **+3.4%** (green)
- Revenue card: **$125,000**
- Month change: **+4.2%** (green)
- Charts showing data trends

### Convex Database
- customers table: 150 documents
- products table: 45 documents
- sales table: 120 documents

---

## ✅ Verification Checklist

### Setup
- [ ] Mutations added to convex/admin.ts
- [ ] Codegen run (npx convex codegen)
- [ ] Demo page loads at /demo-data
- [ ] No errors in console

### Functionality
- [ ] Can create demo data
- [ ] Success toast appears
- [ ] Data appears in Convex dashboard
- [ ] Can clear demo data
- [ ] Deletion confirmed in Convex

### Dashboard Testing
- [ ] Metrics display correctly
- [ ] Formatting is correct ($, %, etc)
- [ ] Colors show trends (green/red)
- [ ] Charts render with data
- [ ] Edge cases handled gracefully

---

## 🐛 Troubleshooting

### Issue: "Failed to create demo data"
**Solution:**
- [ ] Check mutations are exported from convex/admin.ts
- [ ] Run `npx convex codegen`
- [ ] Restart dev servers
- [ ] Check browser console for errors

### Issue: No data appears in Convex
**Solution:**
- [ ] Check Convex dev server is running
- [ ] Verify user is authenticated
- [ ] Check Convex logs for errors
- [ ] Verify mutations are called

### Issue: Dashboard shows no metrics
**Solution:**
- [ ] Refresh browser page
- [ ] Check Convex Data Browser (is data there?)
- [ ] Check query implementation
- [ ] Look for query errors in console

### Issue: Page is 404
**Solution:**
- [ ] Check NODE_ENV is "development"
- [ ] Verify file path: `src/app/(dev-tools)/demo-data/page.tsx`
- [ ] Restart dev server

---

## 🎯 Next Steps After Implementation

1. **Test Each Scenario** - Try all 5 test scenarios
2. **Document Findings** - Note any issues or edge cases
3. **Verify Metrics Accuracy** - Confirm calculations are correct
4. **Test Edge Cases** - Empty data, large values, negative trends
5. **Update Dashboard** - Handle any edge cases found
6. **Share with Team** - Other developers can use for testing

---

## 📚 Related Documentation

- Main guide: `TESTING_DASHBOARD_METRICS.md`
- Dashboard page: `src/features/overview/components/OverviewPage.tsx`
- Convex admin: `convex/admin.ts`
- API reference: `Documentation/reference/API-GUIDE.md`

---

**Status:** Ready for implementation  
**Time to complete:** 15-20 minutes  
**Difficulty:** Easy  

Let me know if you need help with any step!

