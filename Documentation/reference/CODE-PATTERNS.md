# Code Patterns

Common implementation patterns for Invento features.

## Pattern: Form with Validation

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField } from "@/components/ui/form";

// Define schema with validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  price: z.number().positive("Price must be positive"),
  sku: z.string().min(1, "SKU is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, sku: "" },
  });

  const createProduct = useMutation(api.products.createProduct);

  const onSubmit = async (data: ProductFormData) => {
    try {
      await createProduct(data);
      toast.success("Product created!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Product name"
              disabled={form.formState.isSubmitting}
            />
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
}
```

## Pattern: Data Table with Pagination

```typescript
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useState } from "react";

interface Product {
  _id: Id<"products">;
  name: string;
  price: number;
  quantity: number;
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.getValue("price")}`,
  },
  {
    accessorKey: "quantity",
    header: "Stock",
  },
];

export function ProductsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data: products, isLoading } = useQuery(
    api.products.getProducts,
    { page, limit }
  );

  if (isLoading) return <LoadingSkeleton />;
  if (!products) return null;

  return (
    <div>
      <DataTable columns={columns} data={products.items} />
      <Pagination
        page={page}
        total={products.total}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
```

## Pattern: Real-time Data Subscription

```typescript
import { useSubscription } from "convex/react";

export function ProductInventory({ productId }: { productId: Id<"products"> }) {
  // Subscribe to real-time updates
  const product = useQuery(api.products.getProduct, { id: productId });

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h3>{product.name}</h3>
      <p>Stock: {product.quantity}</p>
      {product.quantity < 10 && (
        <Alert variant="warning">
          Low stock - consider reordering
        </Alert>
      )}
    </div>
  );
}
```

## Pattern: Modal with Form

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product,
  });

  const updateProduct = useMutation(api.products.updateProduct);

  const onSubmit = async (data: ProductFormData) => {
    try {
      await updateProduct({ id: product._id, ...data });
      toast.success("Product updated!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields */}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## Pattern: Convex Query with Filtering

```typescript
// In convex/products.ts
export const searchProducts = query({
  args: {
    organizationId: v.id("organizations"),
    search: v.string(),
    category: v.optional(v.string()),
    limit: v.number(),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // Build query
    let query = ctx.db
      .query("products")
      .withIndex("by_organization", (q) =>
        q.eq("organization", args.organizationId)
      );

    // Apply filters
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    // Apply search
    const results = await query.collect();
    const filtered = results.filter((p) =>
      p.name.toLowerCase().includes(args.search.toLowerCase())
    );

    return {
      items: filtered.slice(0, args.limit),
      total: filtered.length,
    };
  },
});
```

## Pattern: Convex Mutation with Validation

```typescript
// In convex/products.ts
export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    sku: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // Validate organization access
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.ownerId !== identity.subject)
      throw new ConvexError("Unauthorized");

    // Validate duplicate SKU
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .first();

    if (existing) throw new ConvexError("SKU already exists");

    // Create product
    const productId = await ctx.db.insert("products", {
      name: args.name,
      price: args.price,
      sku: args.sku,
      organization: args.organizationId,
      quantity: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Record in ledger
    await ctx.db.insert("ledger", {
      organization: args.organizationId,
      type: "credit",
      category: "inventory",
      amount: 0,
      relatedEntity: productId,
      description: `Created product: ${args.name}`,
      createdAt: new Date(),
    });

    return productId;
  },
});
```

## Pattern: Error Handling with Toast

```typescript
import { toast } from "sonner";

export function MyComponent() {
  const handleAction = async () => {
    try {
      await riskyOperation();
      toast.success("Operation completed successfully!");
    } catch (error) {
      if (error instanceof ConvexError) {
        // Handle known errors
        toast.error(error.message);
      } else if (error instanceof Error) {
        // Handle generic errors
        toast.error("An unexpected error occurred");
        console.error(error);
      } else {
        toast.error("Something went wrong");
      }
    }
  };
}
```

## Pattern: Loading States

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCard({ productId }: { productId: Id<"products"> }) {
  const product = useQuery(api.products.getProduct, { id: productId });

  // Loading state
  if (product === undefined) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  // Null/error state
  if (product === null) {
    return <p className="text-gray-500">Product not found</p>;
  }

  // Loaded state
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}
```

## Pattern: Confirmation Dialog Before Delete

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteProductButton({ productId }: Props) {
  const [open, setOpen] = useState(false);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const handleDelete = async () => {
    try {
      await deleteProduct({ id: productId });
      toast.success("Product deleted");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

## Pattern: Responsive Layout

```typescript
import { useMediaQuery } from "react-responsive";

export function Dashboard() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl md:text-3xl font-bold">$45,000</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Pattern: Infinite Scroll

```typescript
import { useCallback, useRef, useEffect } from "react";

export function InfiniteProductList() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const { data: chunk } = useQuery(api.products.getProducts, {
    page,
    limit: 20,
  });

  useEffect(() => {
    if (chunk) {
      setItems((prev) => [...prev, ...chunk.items]);
      setHasMore(chunk.items.length === 20);
    }
  }, [chunk]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((p) => p + 1);
      }
    });

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div>
      {items.map((item) => (
        <ProductCard key={item._id} product={item} />
      ))}
      {hasMore && <div ref={observerTarget} className="h-10" />}
    </div>
  );
}
```
