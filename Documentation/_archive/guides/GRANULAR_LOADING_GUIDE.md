# Granular Loading States Implementation

## Overview

Replace universal loaders with individual loading states per component/section. Each part of your UI loads independently and shows skeletons only where needed.

## Files Created

| File | Purpose |
|------|---------|
| `src/components/skeletons/SkeletonLoaders.tsx` | Reusable skeleton components |
| `src/hooks/useLoadingState.ts` | Hook for managing individual loading states |
| `src/components/examples/GranularLoadingExamples.tsx` | 3 usage examples |

## Quick Start

### 1. Use Skeletons (Data Loading)

```typescript
import { SkeletonTable, SkeletonStatsGrid, SkeletonCard } from '@/components/skeletons/SkeletonLoaders';

export function MyPage() {
  const data = useQuery(api.data.list);
  
  if (data === undefined) {
    return <SkeletonTable rows={5} columns={4} />;
  }
  
  return <DataTable data={data} />;
}
```

### 2. Use Loading State Hook (Mutations)

```typescript
import { useLoadingState } from '@/hooks/useLoadingState';

export function MyForm() {
  const createItem = useMutation(api.items.create);
  const { isLoading, withLoading } = useLoadingState();
  
  // Automatic loading management
  const handleSubmit = withLoading('create', async (data) => {
    await createItem(data);
  });
  
  return (
    <button onClick={handleSubmit} disabled={isLoading('create')}>
      {isLoading('create') ? 'Creating...' : 'Create'}
    </button>
  );
}
```

## Available Skeletons

```typescript
// Single elements
<Skeleton className="h-4 w-32" />
<SkeletonButton />
<SkeletonHeader />

// Collections
<SkeletonTable rows={5} columns={4} />      // Tables
<SkeletonGrid items={6} />                  // Cards grid
<SkeletonStatsGrid count={4} />             // Dashboard KPIs
<SkeletonChart />                           // Charts/graphs
<SkeletonForm fields={3} />                 // Forms
```

## Loading State Hook API

```typescript
const {
  isLoading,      // (key?: string) => boolean - check loading state
  startLoading,   // (key: string) => void - start loading
  stopLoading,    // (key: string) => void - stop loading
  withLoading,    // (key, fn) => () => Promise<void> - auto wrapper
  getAll,         // () => Record<string, boolean> - debug
} = useLoadingState();

// Check specific action
isLoading('create') // true/false

// Check ANY action loading
isLoading() // true if anything is loading

// Auto-manage with withLoading (recommended)
const handleCreate = withLoading('create', async () => {
  await createItem();
});
```

## Patterns

### Pattern 1: Query Loading (Data Fetch)
```typescript
const data = useQuery(api.data.list);

if (data === undefined) {
  return <SkeletonTable />;
}

return <DataTable data={data} />;
```

### Pattern 2: Mutation Loading (Actions)
```typescript
const { isLoading, withLoading } = useLoadingState();

const handleSubmit = withLoading('submit', async () => {
  await mutation(data);
});

<button disabled={isLoading('submit')}>
  {isLoading('submit') ? 'Loading...' : 'Submit'}
</button>
```

### Pattern 3: Multiple Independent Sections
```typescript
const section1 = useQuery(api.section1);
const section2 = useQuery(api.section2);

<div className="space-y-6">
  <Section1 isLoading={section1 === undefined} data={section1} />
  <Section2 isLoading={section2 === undefined} data={section2} />
</div>
```

## Why Granular Loading?

### Before (Universal Loader)
```typescript
// ✗ Bad: Entire page freezes until everything loads
{isLoading && <FullPageSpinner />}
{children}
```

**Result**: User sees loading bar, nothing else (frustrating)

### After (Granular Loading)
```typescript
// ✓ Good: Each section loads independently
{isLoadingKPIs ? <SkeletonStatsGrid /> : <KPIs />}
{isLoadingTable ? <SkeletonTable /> : <DataTable />}
{isLoadingSidebar ? <SkeletonCard /> : <Sidebar />}
```

**Result**: User sees content progressively, more interactive feel

## Implementation Steps

1. **Replace universal loaders**: Find full-page spinners, use section-specific skeletons
2. **Use Convex query state**: `data === undefined` means loading
3. **Use hook for mutations**: `useLoadingState` for button/form actions
4. **Stack skeletons**: Compose multiple skeletons for complex pages

## Examples

See `src/components/examples/GranularLoadingExamples.tsx` for:
- Example 1: Table with loading skeleton
- Example 2: Dashboard with multi-section loading
- Example 3: Mutations with individual button states

## Common Skeletons Needed

```typescript
// Copy-paste these patterns into your components

// Table
if (isLoading) return <SkeletonTable rows={10} columns={5} />;

// Cards grid
if (isLoading) return <SkeletonGrid items={6} />;

// Dashboard stats
if (isLoading) return <SkeletonStatsGrid count={4} />;

// Form
if (isLoading) return <SkeletonForm fields={3} />;

// Chart
if (isLoading) return <SkeletonChart />;
```

## Migration Checklist

- [ ] Find all full-page spinners/loaders
- [ ] Replace with section-specific skeletons
- [ ] Update queries to check `data === undefined`
- [ ] Replace mutation loading with `useLoadingState` hook
- [ ] Test: Do individual sections load independently?
- [ ] Test: Can user interact with loaded sections while others load?

## Notes

- Skeletons are **composable**: Combine `<Skeleton />` components to create custom loaders
- Hook is **token-efficient**: One hook manages all loading states
- **Reuse patterns**: Copy examples into your components
- **Performance**: Skeletons are lightweight, no performance cost

## Next Steps

1. Audit your app for full-page loaders
2. Replace them with section-specific skeletons
3. Update mutations to use `useLoadingState` hook
4. Test in staging environment
