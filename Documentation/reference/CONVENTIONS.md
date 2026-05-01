# Invento Code Conventions

Code style, naming conventions, and design patterns.

## File Organization

### Component Files
```
Feature/
├── components/
│   ├── ComponentName.tsx      # Main component
│   ├── ComponentName.types.ts # TypeScript interfaces
│   └── ComponentName.styles.ts # Styled components (if needed)
├── hooks/
│   └── useComponentLogic.ts   # Component logic
├── utils/
│   └── helpers.ts             # Utility functions
└── index.ts                   # Barrel export
```

### Page Files
- Pages under `src/app/` should be minimal
- Extract logic to components or hooks
- Use layouts for shared structure

### Convex Files
- One file per module (products.ts, sales.ts, etc.)
- Group queries, mutations, and subscriptions
- Export functions, not objects

## Naming Conventions

### TypeScript/React
```typescript
// Components: PascalCase
function ProductForm() {}
export default ProductForm;

// Hooks: useXxx
function useProducts() {}
function useProductFilter() {}

// Utilities: camelCase
function formatCurrency(amount) {}
function parseProductName(name) {}

// Types/Interfaces: PascalCase with T prefix (optional)
interface Product {}
type SaleStatus = "pending" | "delivered";

// Constants: UPPER_SNAKE_CASE
const MAX_PRODUCT_NAME_LENGTH = 100;
const DEFAULT_PAGE_SIZE = 20;
const PAGINATION_LIMITS = {
  MIN: 1,
  MAX: 100,
};

// Variables: camelCase
let currentProduct;
const organizationId = org._id;
```

### Convex
```typescript
// Query functions: getXxx
export const getProducts = query({ ... });
export const getProduct = query({ ... });

// Mutation functions: createXxx, updateXxx, deleteXxx
export const createProduct = mutation({ ... });
export const updateProduct = mutation({ ... });
export const deleteProduct = mutation({ ... });

// Subscription functions: watchXxx (or subscribe)
export const watchProducts = query(async (ctx) => {
  return ctx.db.query("products").collect();
});
```

### Database
```
Collection names: camelCase, singular
- products (not Product, products_table)
- sales (not Sale, sales_records)
- suppliers (not Supplier)

Field names: camelCase
- productName (not product_name, ProductName)
- createdAt (not created_at, CreatedDate)
- organizationId (not org_id, OrgID)
```

## Code Style

### Imports
```typescript
// Order: external → internal modules → utils
import React from "react";
import { useQuery } from "convex/react";

import { ProductForm } from "@/components/ProductForm";
import { formatCurrency } from "@/lib/utils";
```

### Component Structure
```typescript
interface Props {
  productId: Id<"products">;
  onSuccess?: () => void;
}

export default function ProductEditor({ productId, onSuccess }: Props) {
  // 1. Hooks
  const product = useQuery(api.products.getProduct, { id: productId });

  // 2. State
  const [isLoading, setIsLoading] = useState(false);

  // 3. Handlers
  const handleSave = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      // ...
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Render
  if (!product) return <LoadingSkeleton />;
  return <div>...</div>;
}
```

### Error Handling
```typescript
// Always provide user-friendly error messages
try {
  await createProduct({ name, price });
} catch (error) {
  toast.error("Failed to create product. Please try again.");
  console.error("Product creation error:", error);
}
```

### Async Operations
```typescript
// Prefer async/await over .then()
const handleSubmit = async (data) => {
  try {
    const result = await mutate.createProduct(data);
    toast.success("Product created!");
    return result;
  } catch (error) {
    toast.error("Failed to create product");
  }
};
```

## TypeScript Best Practices

### Type Definitions
```typescript
// Use Convex types
import { Id } from "convex/values";

interface Product {
  _id: Id<"products">;
  _creationTime: number;
  name: string;
  price: number;
  // ...
}

// Avoid 'any'
function processProduct(product: Product) {} // ✓ Good
function processProduct(product: any) {} // ✗ Bad
```

### Null/Undefined Handling
```typescript
// Use optional chaining and nullish coalescing
const name = product?.name ?? "Unknown";

// Type guards
if (product && product.name) {
  // ...
}

// Type narrowing
function handleProduct(item: Product | null) {
  if (!item) return;
  console.log(item.name); // item is Product
}
```

## Tailwind CSS Conventions

### Class Organization
```jsx
// Order: layout → sizing → spacing → styling
<div className="flex flex-col gap-4 w-full h-screen bg-white text-gray-900">
  {/* Order: display → width/height → padding/margin → colors → text */}
  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
    Save
  </button>
</div>
```

### Responsive Design
```jsx
// Mobile-first approach
<div className="flex flex-col gap-2 md:flex-row md:gap-4 lg:grid lg:grid-cols-3">
  {/* starts as column on mobile, row on medium, grid on large */}
</div>
```

### Dark Mode
```jsx
// Use next-themes for dark mode
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  {/* Automatically switches based on theme */}
</div>
```

## Component Patterns

### Controlled Forms
```typescript
interface FormData {
  name: string;
  price: number;
}

export function ProductForm() {
  const [formData, setFormData] = useState<FormData>({ name: "", price: 0 });

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <input
      value={formData.name}
      onChange={(e) => handleChange("name", e.target.value)}
    />
  );
}
```

### Data Tables
```typescript
// Use TanStack React Table (installed)
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Product Name" },
  { accessorKey: "price", header: "Price" },
];

export function ProductTable({ data }: { data: Product[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <table>{/* render table */}</table>;
}
```

### Modals/Dialogs
```typescript
// Use shadcn/ui Dialog component
export function EditProductDialog({ product, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  );
}
```

## Performance Optimization

### Memoization
```typescript
// Memoize expensive components
const ProductCard = React.memo(({ product }: Props) => (
  <div>{product.name}</div>
));

// Memoize callbacks
const handleClick = useCallback(() => {
  handleProductChange(productId);
}, [productId]);
```

### Queries & Subscriptions
```typescript
// Only subscribe when needed
const products = useQuery(api.products.getProducts, isOpen ? undefined : "skip");

// Avoid N+1 queries
const products = useQuery(api.products.getProductsWithSuppliers);
```

## Testing Conventions

### Naming
```typescript
// Test file: ComponentName.test.tsx (next to component)
// Test suite: describe("[Unit] ComponentName")

describe("[Unit] ProductForm", () => {
  test("should save product on submit", () => {
    // ...
  });

  test("should show error on invalid input", () => {
    // ...
  });
});
```

## Git Commits

### Message Format
```
<type>(<scope>): <subject>

<body>

<footer>

Examples:
feat(products): add bulk upload feature
fix(billing): correct invoice calculation for discounts
docs(readme): update installation instructions
refactor(auth): extract hook logic from component
test(ledger): add transaction validation tests
```

Types: feat, fix, docs, style, refactor, test, chore

## Documentation in Code

### Comments
```typescript
// Use comments sparingly - code should be self-documenting
// Only comment the "why", not the "what"

// ✗ Bad: Restates code
// Loop through products
for (const product of products) {

// ✓ Good: Explains reasoning
// Filter out discontinued products to comply with inventory policy
const activeProducts = products.filter(p => !p.discontinued);
```

### JSDoc for Public APIs
```typescript
/**
 * Calculate total sales for a given date range
 * @param startDate - Beginning of period (inclusive)
 * @param endDate - End of period (inclusive)
 * @returns Total sales amount in organization currency
 */
export function calculateTotalSales(
  startDate: Date,
  endDate: Date
): number {
  // ...
}
```

## Exception: When to Break Conventions

- **Legacy code**: Don't refactor unless touching for feature
- **External libraries**: Follow their patterns
- **Performance**: Document why convention is broken
- **Accessibility**: Always prioritize a11y over conventions
