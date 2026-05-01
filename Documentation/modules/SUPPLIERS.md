# SUPPLIERS Module

Vendor and supplier management system.

## Responsibility

- Supplier/vendor CRUD operations
- Contact information management
- Supply history and relationships
- Lead time and payment term tracking
- Supplier performance rating

## Key Files

- **Backend**: `convex/suppliers.ts`
- **Frontend**: `src/app/(main)/(authenticated)/dashboard/product/supplier/`

## Data Model

```typescript
Supplier {
  _id: Id<"suppliers">,
  organization: Id<"organizations">,  // Org isolation
  name: string,                       // Company/vendor name
  contactPerson: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  country: string,
  paymentTerms: string,              // "Net 30", "COD", "2/10 Net 30"
  leadTime: number,                  // Days for delivery
  rating: number,                    // 1-5 star rating
  totalOrders?: number,              // Lifetime order count
  isActive: boolean,                 // Active/inactive status
  notes?: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,                  // Soft delete
}
```

## Key Operations

### Create Supplier
- Validate supplier uniqueness (name per org)
- Create supplier document
- Initialize with 0 orders
- Return supplier ID

### Update Supplier
- Validate changes
- Update document
- Update lastModified timestamp
- No cascading needed

### List Suppliers
- Filter by org (always!)
- Support pagination (limit 20)
- Include active/inactive filtering
- Show order count

### Delete Supplier
- Soft delete (set deletedAt) to preserve history
- Hard delete only if no associated products

### Link Products
- Product.supplier references this supplier ID
- Multiple products can reference same supplier
- Unlink product if supplier deleted

## Related Modules

- **PRODUCTS** - Products supplied by this supplier
- **SALES** - Order history with supplier
- **LEDGER** - Payment records
- **BILLING** - Invoice tracking with supplier

## Common Patterns

### Get Suppliers
```typescript
const suppliers = useQuery(api.suppliers.getSuppliers, {
  organizationId: org._id,
  limit: 20,
});
```

### Create Supplier
```typescript
const supplier = useMutation(api.suppliers.createSupplier);
await supplier({
  name, contactPerson, email, phone,
  paymentTerms, leadTime,
  organizationId: org._id,
});
```

### Link Product to Supplier
When creating a product, set supplier ID:
```typescript
const product = useMutation(api.products.createProduct);
await product({
  name, sku, price,
  supplier: supplierId,  // Link to supplier
  organizationId: org._id,
});
```

### Track Supplier Performance
- Rating updated on successful deliveries
- Total orders incremented on purchase
- Lead time accuracy tracked in ledger

## Integration Points

### With Products
- Product has `supplier: Id<"suppliers">`
- When supplier deleted, products remain but supplier reference broken
- Display supplier details on product card

### With Sales
- Sale references supplier indirectly through products
- Use product.supplier to get supplier info
- Track which suppliers appear most in sales

### With Ledger
- Payment records linked to supplier
- Track supplier payment history
- Audit trail for all supplier transactions

### With Billing
- Supplier information used in purchase orders
- Payment tracking in invoices
- Supplier-specific payment terms

## Database Indexes

```typescript
suppliers: defineTable({
  // ... fields
})
  .index("by_organization", ["organization"])
  .index("by_name", ["organization", "name"])
  .index("by_active", ["organization", "isActive"])
```

## Testing Considerations

- Verify supplier creation with org isolation
- Test product linking to supplier
- Verify deletion doesn't break products
- Test pagination
- Test supplier deactivation
- Verify payment terms tracking
- Test rating updates on sales

## Typical Workflows

### Add New Supplier
1. User fills supplier form (name, contact, terms)
2. System creates supplier
3. User can now link products to this supplier
4. On purchase, supplier tracked in sales/ledger

### Update Supplier Info
1. User opens supplier details
2. Edit contact info, payment terms, etc.
3. Changes reflected immediately
4. History maintained via updatedAt

### Deactivate Supplier
1. User marks supplier as inactive
2. Can still view history
3. Cannot add new products from this supplier
4. Existing products still show supplier info

## API Functions (In convex/suppliers.ts)

```typescript
export const createSupplier = mutation({ ... })
export const updateSupplier = mutation({ ... })
export const deleteSupplier = mutation({ ... })  // Soft delete
export const getSuppliers = query({ ... })
export const getSupplier = query({ ... })
export const searchSuppliers = query({ ... })
export const getSupplierByName = query({ ... })
```

## Related Documentation

- [PRODUCTS.md](PRODUCTS.md) - Products from this supplier
- [SALES.md](SALES.md) - Orders from this supplier
- [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md) - Schema details
- [API-GUIDE.md](../API-GUIDE.md) - Query patterns
