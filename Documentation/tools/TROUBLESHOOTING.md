# Troubleshooting

Common issues and solutions.

## Development Issues

### Convex Connection Failed
**Problem**: Cannot connect to Convex development environment.

**Solution**:
```bash
# 1. Restart Convex development server
npx convex dev

# 2. Check auth credentials
cat .env.local | grep CONVEX

# 3. Clear cache
rm -rf .convex/
npx convex dev
```

---

### Type Errors in Convex Functions
**Problem**: `_generated/api.d.ts` out of sync.

**Solution**:
```bash
# Regenerate types
npx convex dev  # Runs in background, regenerates types

# Force regeneration
rm convex/_generated/api.d.ts
npx convex dev
```

---

### Real-time Subscription Not Updating
**Problem**: Data doesn't update in real-time on component.

**Solution**:
```typescript
// ✓ Correct: useQuery always subscribes
const data = useQuery(api.products.getProducts, { orgId });

// ✗ Incorrect: skip prevents subscription
const data = useQuery(api.products.getProducts, skip ? "skip" : { orgId });

// ✓ Fix: Move skip logic differently
const data = useQuery(api.products.getProducts, orgId ? { orgId } : "skip");
```

---

## Authentication Issues

### Clerk Sign-in Loop
**Problem**: User stuck in sign-in page after login.

**Solution**:
1. Check `ConvexProvider` wraps entire app
2. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`
3. Clear browser cookies and local storage
4. Check Clerk dashboard for org configuration

---

### Missing Organization After Sign-up
**Problem**: User signs up but no organization created.

**Solution**:
1. Check `company-details` page completes
2. Verify organization mutation in Convex
3. Check user ID matches Clerk `sub` value

---

## Database Issues

### Duplicate SKU Error
**Problem**: Cannot create product with SKU that exists.

**Solution**:
```typescript
// Check for existing SKU
const existing = await ctx.db
  .query("products")
  .withIndex("by_sku", (q) => q.eq("sku", newSku))
  .first();

if (existing) {
  // Either choose new SKU or update existing
  const newSku = sku + "-" + Math.random().toString(36).substr(2, 5);
}
```

---

### Incorrect Quantity After Sale
**Problem**: Product quantity not decremented after sale.

**Solution**:
Check that sale mutation updates product inventory:
```typescript
// In sales.ts mutation
for (const item of args.items) {
  const product = await ctx.db.get(item.productId);
  await ctx.db.patch(product._id, {
    quantity: product.quantity - item.quantity,
  });
}
```

---

### Ledger Balance Incorrect
**Problem**: Balance doesn't match expected total.

**Solution**:
```typescript
// 1. Audit all ledger entries
const entries = await ctx.db
  .query("ledger")
  .withIndex("by_organization", (q) => q.eq("organization", orgId))
  .collect();

// 2. Recalculate balance
let balance = 0;
for (const entry of entries.sort((a, b) => 
  a.createdAt.getTime() - b.createdAt.getTime())) {
  if (entry.type === "credit") balance += entry.amount;
  if (entry.type === "debit") balance -= entry.amount;
}

// 3. Check if matches expected
console.log("Calculated balance:", balance);
```

---

## Performance Issues

### Slow Product List Loading
**Problem**: Product list takes >2s to load.

**Solution**:
1. **Check index usage**:
   ```typescript
   // Use index
   .withIndex("by_organization", (q) => q.eq("organization", orgId))
   ```

2. **Add pagination**:
   ```typescript
   .take(20)  // Limit results
   ```

3. **Avoid N+1 queries**:
   ```typescript
   // Batch load suppliers instead of per-product
   ```

---

### Large File Upload Timeout
**Problem**: Image upload fails for large files.

**Solution**:
1. Compress before upload (installed: `browser-image-compression`)
   ```typescript
   import imageCompression from "browser-image-compression";
   const compressed = await imageCompression(file, { maxSizeMB: 1 });
   ```

2. Use EdgeStore directly (configured in app)

---

## UI/UX Issues

### Form Not Responding to Submission
**Problem**: Submit button doesn't trigger save.

**Solution**:
```typescript
// Check form submission handler
const handleSubmit = form.handleSubmit(async (data) => {
  // This receives validated data only
  const result = await mutate(data);
});

// Debug: Log to verify trigger
console.log("Form valid:", form.formState.isValid);
console.log("Errors:", form.formState.errors);
```

---

### Theme Not Switching
**Problem**: Dark mode doesn't toggle.

**Solution**:
1. Check `ThemeToggle` component in `/components/layout/`
2. Verify `next-themes` provider wraps app
3. Check CSS has dark mode styles

---

## Payment Issues

### Razorpay Payment Not Processing
**Problem**: Payment button shows but doesn't open Razorpay dialog.

**Solution**:
1. Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` set in `.env.local`
2. Verify payment mutation exists in `convex/billing.ts`
3. Check network tab for payment API calls

---

### Invoice Not Generating
**Problem**: Sales order created but invoice missing.

**Solution**:
```typescript
// Check invoice auto-generation
export const createSale = mutation({
  handler: async (ctx, args) => {
    const saleId = await ctx.db.insert("sales", ...);
    
    // Must generate invoice
    if (args.shouldGenerateInvoice) {
      await ctx.db.insert("invoices", {
        saleId,
        // ... invoice details
      });
    }
    
    return saleId;
  },
});
```

---

## Deployment Issues

### Build Fails With Type Errors
**Problem**: `npm run build` fails.

**Solution**:
```bash
# 1. Check TypeScript errors
npx tsc --noEmit

# 2. Check lint errors
npm run lint:strict

# 3. Fix strict mode issues
npm run lint:fix
```

---

### Environment Variables Not Loaded
**Problem**: `.env` variables undefined in production.

**Solution**:
1. Check `.env.example` matches deployed `.env`
2. Verify all `NEXT_PUBLIC_*` vars set
3. Check `CONVEX_DEPLOYMENT` matches Convex project
4. Rebuild after env changes

---

## Getting Help

### Debug Checklist
- [ ] Restart dev server
- [ ] Clear cache/node_modules
- [ ] Check console for errors
- [ ] Verify auth token exists
- [ ] Check organization context
- [ ] Look at Convex dashboard logs
- [ ] Check network tab for failed requests

### Where to Look
- **Frontend errors**: Browser console
- **Backend errors**: Convex dashboard logs
- **Database issues**: Convex data browser
- **Auth issues**: Clerk dashboard
- **Payment issues**: Razorpay dashboard

