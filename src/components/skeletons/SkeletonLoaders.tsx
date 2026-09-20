'use client';

import { cn } from '@/lib/utils';

/**
 * Generic Skeleton Component
 * Highly reusable - compose to create any loading state
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-800',
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton Row for tables/lists
 * Shows: [checkbox] [col1] [col2] [col3]
 */
export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className='flex items-center gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800'>
      <Skeleton className='h-4 w-4 rounded' />
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <Skeleton key={i} className='h-4 flex-1' />
      ))}
    </div>
  );
}

/**
 * Skeleton Table
 * Shows loading state for entire table
 */
export function SkeletonTable({
  rows = 5,
  columns = 4
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className='rounded-md border border-slate-200 dark:border-slate-800'>
      {/* Header */}
      <div className='flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50'>
        <Skeleton className='h-4 w-4 rounded' />
        {Array.from({ length: columns - 1 }).map((_, i) => (
          <Skeleton key={i} className='h-4 flex-1' />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} columns={columns} />
      ))}
    </div>
  );
}

/**
 * Skeleton Card
 * Shows loading state for card/panel
 */
export function SkeletonCard({ hasImage = true }: { hasImage?: boolean }) {
  return (
    <div className='space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800'>
      {hasImage && <Skeleton className='h-40 w-full rounded-md' />}
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
      <div className='flex gap-2 pt-2'>
        <Skeleton className='h-8 w-20 rounded-md' />
        <Skeleton className='h-8 w-20 rounded-md' />
      </div>
    </div>
  );
}

/**
 * Skeleton Chart/Graph
 * Shows loading state for analytics/charts
 */
export function SkeletonChart() {
  return (
    <div className='space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800'>
      <Skeleton className='h-6 w-32' />
      <div className='space-y-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex items-center gap-2'>
            <Skeleton className='h-20 w-12' />
            <Skeleton className='h-4 flex-1' />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Form
 * Shows loading state for form fields
 */
export function SkeletonForm({ fields = 3 }: { fields?: number }) {
  return (
    <div className='space-y-4'>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full rounded-md' />
        </div>
      ))}
      <div className='flex gap-2 pt-4'>
        <Skeleton className='h-10 w-24 rounded-md' />
        <Skeleton className='h-10 w-24 rounded-md' />
      </div>
    </div>
  );
}

/**
 * Skeleton Grid
 * Shows loading state for grid layouts
 */
export function SkeletonGrid({ items = 6 }: { items?: number }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton Stat Box (for dashboards)
 * Shows loading state for KPI card
 */
export function SkeletonStatBox() {
  return (
    <div className='rounded-lg border border-slate-200 p-4 dark:border-slate-800'>
      <Skeleton className='mb-3 h-4 w-24' />
      <Skeleton className='mb-2 h-8 w-32' />
      <Skeleton className='h-3 w-20' />
    </div>
  );
}

/**
 * Skeleton Stats Grid (for dashboards)
 * Shows loading state for multiple KPI cards
 */
export function SkeletonStatsGrid({ count = 4 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatBox key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton Button
 * Shows loading state for button
 */
export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-10 w-32 rounded-md', className)} />;
}

/**
 * Skeleton Header
 * Shows loading state for page header/title
 */
export function SkeletonHeader() {
  return (
    <div className='space-y-3'>
      <Skeleton className='h-8 w-48' />
      <Skeleton className='h-4 w-96' />
    </div>
  );
}
