# Error Handling System Documentation

## Overview

The error handling system provides comprehensive error tracking, categorization, and user-friendly error display across the entire Invento application. It consists of multiple layers:

1. **Route-level error boundaries** - Catch errors at different route layers
2. **Component-level error boundaries** - Catch errors within specific components
3. **Error tracking utilities** - Log and categorize errors
4. **Error display components** - Render errors to users
5. **Hooks for error handling** - Integrate error handling in components

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Root Error Boundary (src/app/error.tsx)                    │
│  Catches: Top-level application errors                       │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│  Authenticated Layout Error (src/app/(authenticated)/error) │
│  Catches: Auth-related errors, with user context             │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│  Feature-level Errors (dashboard/, inventory/, sales/, etc) │
│  Catches: Errors in specific features                        │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│  Component-level Boundaries                                  │
│  - DataTableErrorBoundary                                    │
│  - FormErrorBoundary                                         │
│  Catches: Errors within components                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Categories

Errors are automatically categorized for consistent handling:

| Category | Description | Recoverable | Redirect |
|----------|-------------|-------------|----------|
| `CONVEX_ERROR` | Database/API failures | ✓ | ✗ |
| `AUTH_ERROR` | Authentication failures | ✗ | ✓ |
| `VALIDATION_ERROR` | Form/input validation | ✓ | ✗ |
| `PERMISSION_ERROR` | Access denied | ✗ | ✓ |
| `NOT_FOUND` | Resource not found | ✗ | ✗ |
| `NETWORK_ERROR` | Network/connectivity | ✓ | ✗ |
| `UNKNOWN_ERROR` | Uncategorized | ✓ | ✗ |

---

## Usage Patterns

### 1. Route-Level Error Handling

All route-level error.tsx files automatically log errors with feature context:

```typescript
// src/app/(main)/(authenticated)/products/error.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { formatErrorForDisplay } from '@/lib/error-tracking';

export default function ProductsError({ error, reset }) {
  const { userId, orgId } = useAuth();

  const formattedError = formatErrorForDisplay(error, {
    category: 'CONVEX_ERROR',
    userId: userId || undefined,
    organizationId: orgId || undefined,
    feature: 'products',
    action: 'load_products',
  });

  return (
    <ErrorDisplay
      error={formattedError}
      onRetry={reset}
      fullPage={false}
      rawError={error}
    />
  );
}
```

**Files created:**
- `src/app/error.tsx` - Root level
- `src/app/(main)/(authenticated)/error.tsx` - Authenticated layout
- `src/app/(main)/(authenticated)/dashboard/error.tsx` - Dashboard
- `src/app/(main)/(authenticated)/inventory/error.tsx` - Inventory
- `src/app/(main)/(authenticated)/sales/error.tsx` - Sales
- `src/app/(main)/(authenticated)/ledger/error.tsx` - Ledger
- `src/app/(main)/(authenticated)/billing/error.tsx` - Billing
- `src/app/(main)/(authenticated)/settings/error.tsx` - Settings
- `src/app/(main)/(authenticated)/organization/error.tsx` - Organization
- `src/app/(main)/(authenticated)/reports/error.tsx` - Reports
- `src/app/(main)/(authenticated)/expenses/error.tsx` - Expenses

### 2. Data Table Error Boundary

Use for errors within data table components:

```typescript
import { DataTableErrorBoundary } from '@/components/errors/DataTableErrorBoundary';
import { ProductsTable } from './ProductsTable';

export function ProductsPage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <DataTableErrorBoundary 
      featureName="products"
      onRetry={handleRetry}
    >
      <ProductsTable />
    </DataTableErrorBoundary>
  );
}
```

**Benefits:**
- Catches rendering errors within table
- Shows inline error alert
- Provides retry mechanism
- No full page reload needed

### 3. Form Error Boundary

Use for errors within form components:

```typescript
import { FormErrorBoundary } from '@/components/errors/FormErrorBoundary';
import { CreateProductForm } from './CreateProductForm';

export function CreateProductPage() {
  return (
    <FormErrorBoundary 
      featureName="products"
      actionName="create_product"
    >
      <CreateProductForm />
    </FormErrorBoundary>
  );
}
```

**Benefits:**
- Catches form rendering errors
- Tracks form submission failures
- Shows validation error messages
- Retryable errors have retry button

### 4. Hook-Based Error Handling (Recommended for Mutations)

Use `useErrorHandler` hook for mutations and async operations:

```typescript
'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';

export function CreateProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const createProduct = useMutation(api.products.create);
  
  const { handleError } = useErrorHandler({
    feature: 'products',
    action: 'create_product',
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await createProduct(formData);
      toast.success('Product created!');
    } catch (error) {
      handleError(error); // Automatically logs and formats
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

---

## Error Tracking Utilities

### `formatErrorForDisplay(error, context)`

Format any error for display in the UI:

```typescript
import { formatErrorForDisplay } from '@/lib/error-tracking';

const formattedError = formatErrorForDisplay(error, {
  category: 'CONVEX_ERROR',
  userId: 'user_123',
  organizationId: 'org_456',
  feature: 'products',
  action: 'update_product',
  metadata: {
    productId: 'prod_789',
    timestamp: Date.now(),
  },
});

// Returns:
// {
//   title: 'Data Error',
//   message: 'Unable to fetch data. Please try again.',
//   isRecoverable: true,
//   shouldRedirect: false,
//   errorId: 'err_1234567890_abc123def45',
//   category: 'CONVEX_ERROR',
// }
```

### `categorizeError(error)`

Automatically categorize error by type:

```typescript
import { categorizeError } from '@/lib/error-tracking';

const category = categorizeError(error);
// Returns: 'CONVEX_ERROR' | 'AUTH_ERROR' | 'VALIDATION_ERROR' | etc.
```

### `logError(error, context)`

Log error with automatic categorization:

```typescript
import { logError } from '@/lib/error-tracking';

const report = logError(error, {
  feature: 'products',
  action: 'delete_product',
});

// Returns ErrorReport with id, category, message, stack, timestamp, etc.
// Automatically logs to console in dev mode
```

### `getUserFriendlyMessage(category, customMessage?)`

Get user-friendly error message:

```typescript
import { getUserFriendlyMessage } from '@/lib/error-tracking';

const message = getUserFriendlyMessage('NETWORK_ERROR');
// Returns: 'Network connection error. Please check your connection.'
```

---

## Error Display Component

The `<ErrorDisplay />` component renders errors in different modes:

### Full-page mode:
```typescript
<ErrorDisplay
  error={formattedError}
  onRetry={handleRetry}
  fullPage={true}
  rawError={error}
  showErrorId={true}
/>
```

### Inline mode:
```typescript
<ErrorDisplay
  error={formattedError}
  onRetry={handleRetry}
  fullPage={false}
  rawError={error}
  showErrorId={true}
/>
```

### Features:
- ✓ Full-page and inline modes
- ✓ Retry button (if recoverable)
- ✓ Error ID for support
- ✓ Dev-mode stack traces
- ✓ Responsive design
- ✓ Dark mode support

---

## Best Practices

### 1. Always provide context
```typescript
// ✓ Good
formatErrorForDisplay(error, {
  category: 'CONVEX_ERROR',
  feature: 'inventory',
  action: 'update_stock',
  metadata: { productId, quantity },
});

// ✗ Bad
formatErrorForDisplay(error, { category: 'UNKNOWN_ERROR' });
```

### 2. Use feature-specific error.tsx files
```
✓ Create error.tsx at appropriate route levels
✓ Each error boundary captures specific context
✓ Enables accurate error tracking
```

### 3. Handle mutations with useErrorHandler hook
```typescript
// ✓ Recommended
const { handleError } = useErrorHandler({
  feature: 'products',
  action: 'create',
});

try {
  await mutation(data);
} catch (error) {
  handleError(error);
}

// ✗ Avoid
try {
  await mutation(data);
} catch (error) {
  console.error(error);
}
```

### 4. Wrap data tables and forms
```typescript
// ✓ Good - catches rendering errors
<DataTableErrorBoundary featureName="products">
  <ProductsTable />
</DataTableErrorBoundary>

// ✗ Bad - errors propagate up
<ProductsTable />
```

### 5. Log with meaningful action names
```typescript
// ✓ Good - specific actions
action: 'create_product'
action: 'update_inventory'
action: 'approve_order'

// ✗ Bad - vague actions
action: 'operation'
action: 'process'
action: 'handle'
```

---

## Error Reporting Integration

The system is designed for easy integration with error reporting services:

### Add to Sentry:
```typescript
// In src/lib/error-tracking.ts, logError function:
import * as Sentry from '@sentry/nextjs';

if (!isDev) {
  Sentry.captureException(error, {
    tags: {
      category: report.category,
      feature: context.feature,
      action: context.action,
    },
    extra: context.metadata,
  });
}
```

### Add to LogRocket:
```typescript
import LogRocket from 'logrocket';

if (!isDev) {
  LogRocket.captureException(error, {
    tags: {
      category: report.category,
    },
  });
}
```

---

## Files Created

| File | Purpose | Type |
|------|---------|------|
| `src/lib/error-tracking.ts` | Error categorization & logging | Utility |
| `src/components/errors/ErrorDisplay.tsx` | Error UI component | Component |
| `src/components/errors/DataTableErrorBoundary.tsx` | Data table errors | Boundary |
| `src/components/errors/FormErrorBoundary.tsx` | Form errors | Boundary |
| `src/hooks/useErrorHandler.ts` | Error handling hook | Hook |
| `src/app/error.tsx` | Root error boundary | Route |
| `src/app/(main)/(authenticated)/error.tsx` | Auth layout errors | Route |
| `src/app/(main)/(authenticated)/*/error.tsx` | Feature errors (8 files) | Route |

---

## Testing Error Boundaries

To test error boundaries during development:

```typescript
// Add error throwing component
'use client';

export function ErrorTest({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error from ErrorTest component');
  }

  return <div>No error</div>;
}

// Use in your page
<ErrorTest shouldThrow={true} />
```

Then the nearest error boundary will catch and display it.

---

## Debugging Tips

1. **See error IDs in production**: Error IDs are always logged, helping users report issues
2. **Dev mode shows stack traces**: Full stack traces visible in development
3. **Check console logs**: Errors logged to console with context
4. **Use error boundaries selectively**: Not every component needs a boundary
5. **Test retry functionality**: Ensure retry handlers work properly

---

## Next Steps

1. ✅ Route-level error.tsx files created
2. ✅ Component-level error boundaries implemented
3. ✅ Error tracking utilities ready
4. ✅ Error display component built
5. **TODO**: Integrate with error reporting service (Sentry, LogRocket, etc.)
6. **TODO**: Add error analytics dashboard
7. **TODO**: Set up error alerts for critical errors

---

## Support

For questions about error handling:
1. Check this documentation
2. Review example usage in error.tsx files
3. Check `@lib/error-tracking.ts` for categorization logic
4. Review RootErrorBoundary for class-based pattern
