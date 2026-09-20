# PRODUCTS Module

Product catalog and inventory management.

## Responsibility

- Product CRUD operations
- Inventory level tracking
- SKU management
- Product categorization
- Stock alerts

## Key Files

- **Backend**: `convex/products.ts`
- **Frontend**: `src/app/(main)/(authenticated)/dashboard/product/`

## Data Model

```typescript
Product {
  _id: Id<"products">,
  organization: Id<"organizations">,  // Org isolation
  name: string,
  sku: string,                        // Unique per org
  category: string,
  quantity: number,                   // Current stock
  price: number,                      // Selling price
  costPrice: number,
  supplier: Id<"suppliers">,
  description: string,
  image: string,                      // URL from EdgeStore
  createdAt: Date,
  updatedAt: Date,
}
```

## Key Operations

### Create Product
- Validate SKU uniqueness (per org)
- Create product document
- Record in ledger (inventory add)
- Return product ID

### Update Product
- Validate changes
- Update document
- Record quantity changes in ledger

### Delete Product
- Soft delete (set deletedAt)
- OR hard delete (if never sold)

### List Products
- Filter by org (always!)
- Support pagination (limit 20)
- Include search filtering
- Show stock status

## Related Modules

- **SUPPLIERS** - Product source
- **SALES** - Product consumption
- **LEDGER** - Inventory audit trail
- **BILLING** - Price information

## Common Patterns

### Get Products
```typescript
const products = useQuery(api.products.getProducts, {
  organizationId: org._id,
  limit: 20,
});
```

### Create Product
```typescript
const product = useMutation(api.products.createProduct);
await product({
  name, sku, price, costPrice, supplier, category,
  organizationId: org._id,
});
```

### Track Stock Changes
All quantity changes auto-recorded in ledger for audit trail.

## Testing Considerations

- Verify SKU uniqueness per org
- Test stock deduction on sales
- Verify ledger entries created
- Test pagination
- Test image upload to EdgeStore
