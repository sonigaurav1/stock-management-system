'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Enterprise-grade skeleton loader with shimmer animation
 * Used for dashboard, widget, and content loading states
 */

interface SkeletonVariant {
  variant: 'card' | 'chart' | 'table' | 'list-item' | 'metric' | 'header';
  count?: number;
}

/**
 * Base shimmer skeleton component
 */
export function ShimmerSkeleton({
  className,
  animate = true,
  style
}: {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        'rounded-lg',
        'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
        'dark:from-slate-800 dark:via-slate-700 dark:to-slate-800',
        animate && 'animate-pulse',
        className
      )}
      role='status'
      aria-label='Loading content'
      style={style}
    />
  );
}

/**
 * Advanced shimmer effect with wave animation
 */
export function AdvancedShimmer({
  className,
  children
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100',
        'dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
        className
      )}
    >
      {/* Shimmer wave effect */}
      <div className='animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10' />
      {children}
    </div>
  );
}

/**
 * Enterprise Metric Card Skeleton
 */
export function MetricCardSkeleton() {
  return (
    <AdvancedShimmer className='h-32 rounded-2xl p-6'>
      <div className='space-y-3'>
        {/* Title skeleton */}
        <ShimmerSkeleton className='h-5 w-32' />
        {/* Large number skeleton */}
        <ShimmerSkeleton className='h-10 w-28' />
        {/* Subtitle skeleton */}
        <ShimmerSkeleton className='h-4 w-48' />
      </div>
    </AdvancedShimmer>
  );
}

/**
 * Enterprise Chart Card Skeleton
 */
export function ChartCardSkeleton() {
  return (
    <AdvancedShimmer className='h-72 rounded-2xl p-6'>
      <div className='space-y-4'>
        {/* Header */}
        <div className='space-y-2'>
          <ShimmerSkeleton className='h-6 w-40' />
          <ShimmerSkeleton className='h-4 w-56' />
        </div>
        {/* Chart area */}
        <div className='flex items-end gap-3 pt-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerSkeleton
              key={i}
              className='flex-1'
              style={{ height: `${30 + Math.random() * 100}%` }}
            />
          ))}
        </div>
      </div>
    </AdvancedShimmer>
  );
}

/**
 * Enterprise List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <AdvancedShimmer className='h-16 rounded-xl px-4 py-3'>
      <div className='flex items-center gap-4'>
        {/* Icon placeholder */}
        <ShimmerSkeleton className='h-10 w-10 shrink-0 rounded-lg' />
        {/* Content */}
        <div className='flex-1 space-y-2'>
          <ShimmerSkeleton className='h-4 w-32' />
          <ShimmerSkeleton className='h-3 w-48' />
        </div>
        {/* Badge/value */}
        <ShimmerSkeleton className='h-6 w-20 rounded-full' />
      </div>
    </AdvancedShimmer>
  );
}

/**
 * Enterprise Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <AdvancedShimmer className='h-12 rounded-lg px-4 py-2'>
      <div className='flex items-center gap-4'>
        {/* Checkbox */}
        <ShimmerSkeleton className='h-5 w-5 shrink-0' />
        {/* Columns */}
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerSkeleton
            key={i}
            className='h-4 flex-1'
            style={{ opacity: 0.6 + (i / columns) * 0.4 }}
          />
        ))}
      </div>
    </AdvancedShimmer>
  );
}

/**
 * Enterprise Header Skeleton
 */
export function HeaderSkeleton() {
  return (
    <AdvancedShimmer className='mb-8 space-y-3'>
      <div className='flex items-center gap-4'>
        {/* Icon */}
        <ShimmerSkeleton className='h-10 w-10 shrink-0 rounded-lg' />
        {/* Title and subtitle */}
        <div className='flex-1 space-y-2'>
          <ShimmerSkeleton className='h-8 w-64' />
          <ShimmerSkeleton className='h-4 w-96' />
        </div>
      </div>
      {/* Actionbar skeleton */}
      <div className='flex gap-3 pt-2'>
        <ShimmerSkeleton className='h-10 w-28 rounded-lg' />
        <ShimmerSkeleton className='h-10 w-28 rounded-lg' />
        <ShimmerSkeleton className='h-10 w-28 rounded-lg' />
      </div>
    </AdvancedShimmer>
  );
}

/**
 * Enterprise Dashboard Grid Skeleton
 */
export function DashboardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='space-y-6'>
      {/* Header skeleton */}
      <HeaderSkeleton />

      {/* Main grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className='flex min-h-80 flex-col'>
            {i < 3 ? <MetricCardSkeleton /> : <ChartCardSkeleton />}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Enterprise Tab Skeleton
 */
export function TabSkeleton() {
  return (
    <AdvancedShimmer className='space-y-4'>
      {/* Tab list */}
      <div className='flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-800'>
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerSkeleton
            key={i}
            className='h-9 w-24'
            style={{ opacity: 0.8 - i * 0.15 }}
          />
        ))}
      </div>

      {/* Tab content grid */}
      <div className='grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='h-48'>
            <MetricCardSkeleton />
          </div>
        ))}
      </div>
    </AdvancedShimmer>
  );
}

/**
 * Enterprise List Skeleton
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3'>
        <ShimmerSkeleton className='h-6 w-48' />
        <ShimmerSkeleton className='h-9 w-28 rounded-lg' />
      </div>

      {/* List items */}
      <div className='space-y-2'>
        {Array.from({ length: count }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Enterprise Insight Card Skeleton
 */
export function InsightCardSkeleton() {
  return (
    <AdvancedShimmer className='h-40 rounded-2xl border border-slate-200 p-5 dark:border-slate-800'>
      <div className='space-y-4'>
        {/* Icon and title */}
        <div className='flex items-start justify-between'>
          <div className='flex-1 space-y-2'>
            <ShimmerSkeleton className='h-5 w-32' />
            <ShimmerSkeleton className='h-4 w-48' />
          </div>
          <ShimmerSkeleton className='h-8 w-8 shrink-0 rounded-lg' />
        </div>
        {/* Description */}
        <ShimmerSkeleton className='h-3 w-full' />
        <ShimmerSkeleton className='h-3 w-3/4' />
      </div>
    </AdvancedShimmer>
  );
}

/**
 * Enterprise Insights Grid Skeleton
 */
export function InsightsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <ShimmerSkeleton className='h-6 w-40' />
        <ShimmerSkeleton className='h-6 w-16 rounded-full' />
      </div>

      {/* Grid */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: count }).map((_, i) => (
          <InsightCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Enterprise Widget Grid Skeleton with mixed content
 */
export function WidgetGridSkeleton({
  showHeader = true,
  showTabs = true,
  showInsights = true,
  count = 6
}: {
  showHeader?: boolean;
  showTabs?: boolean;
  showInsights?: boolean;
  count?: number;
} = {}) {
  return (
    <div className='space-y-8 duration-500 animate-in fade-in-50'>
      {/* Header */}
      {showHeader && <HeaderSkeleton />}

      {/* Tabs */}
      {showTabs && (
        <div className='space-y-4'>
          <div className='flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-800'>
            {Array.from({ length: 4 }).map((_, i) => (
              <ShimmerSkeleton
                key={i}
                className='h-10 w-24 rounded-lg'
                style={{ opacity: 0.8 - i * 0.15 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Insights Section */}
      {showInsights && (
        <div className='pt-4'>
          <InsightsGridSkeleton count={3} />
        </div>
      )}

      {/* Main widget grid */}
      <div className='space-y-4'>
        <ShimmerSkeleton className='h-6 w-40' />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: count }).map((_, i) => {
            const variant = i % 3;
            return (
              <div key={i} className='min-h-80'>
                {variant === 0 ? (
                  <MetricCardSkeleton />
                ) : variant === 1 ? (
                  <ChartCardSkeleton />
                ) : (
                  <ListSkeleton count={3} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer spacer */}
      <div className='h-8' />
    </div>
  );
}

/**
 * Enterprise Stock Levels Skeleton
 */
export function StockLevelsSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Header with filters */}
      <div className='flex items-center justify-between'>
        <ShimmerSkeleton className='h-7 w-48' />
        <div className='flex gap-2'>
          <ShimmerSkeleton className='h-10 w-32 rounded-lg' />
          <ShimmerSkeleton className='h-10 w-32 rounded-lg' />
        </div>
      </div>

      {/* Table skeleton */}
      <AdvancedShimmer className='overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800'>
        {/* Table header */}
        <div className='h-12 border-b border-slate-200 px-4 py-3 dark:border-slate-800'>
          <div className='flex items-center gap-4'>
            <ShimmerSkeleton className='h-5 w-5' />
            {Array.from({ length: 5 }).map((_, i) => (
              <ShimmerSkeleton
                key={i}
                className='h-4 flex-1'
                style={{ opacity: 0.8 - i * 0.12 }}
              />
            ))}
          </div>
        </div>

        {/* Table rows */}
        <div className='divide-y divide-slate-200 dark:divide-slate-800'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='h-12 px-4 py-3'>
              <div className='flex items-center gap-4'>
                <ShimmerSkeleton className='h-5 w-5' />
                {Array.from({ length: 5 }).map((_, j) => (
                  <ShimmerSkeleton
                    key={j}
                    className='h-4 flex-1'
                    style={{ opacity: 0.8 - j * 0.12 }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdvancedShimmer>

      {/* Pagination skeleton */}
      <div className='flex items-center justify-between'>
        <ShimmerSkeleton className='h-5 w-40' />
        <div className='flex gap-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerSkeleton key={i} className='h-9 w-9 rounded-lg' />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Enterprise Reorder Recommendations Skeleton
 */
export function ReorderSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Summary cards */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <AdvancedShimmer key={i} className='h-24 rounded-lg p-4'>
            <div className='space-y-2'>
              <ShimmerSkeleton className='h-5 w-20' />
              <ShimmerSkeleton className='h-7 w-24' />
              <ShimmerSkeleton className='h-3 w-32' />
            </div>
          </AdvancedShimmer>
        ))}
      </div>

      {/* Main content */}
      <AdvancedShimmer className='space-y-4 rounded-xl p-6'>
        {/* Title and controls */}
        <div className='flex items-center justify-between'>
          <ShimmerSkeleton className='h-6 w-40' />
          <div className='flex gap-2'>
            <ShimmerSkeleton className='h-9 w-20 rounded-lg' />
            <ShimmerSkeleton className='h-9 w-20 rounded-lg' />
          </div>
        </div>

        {/* Items list */}
        <div className='space-y-3 pt-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='rounded-lg border border-slate-200 p-4 dark:border-slate-800'
            >
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <ShimmerSkeleton className='h-5 w-40' />
                  <ShimmerSkeleton className='h-6 w-16 rounded-full' />
                </div>
                <div className='grid grid-cols-3 gap-3'>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j}>
                      <ShimmerSkeleton className='mb-2 h-3 w-16' />
                      <ShimmerSkeleton className='h-5 w-20' />
                    </div>
                  ))}
                </div>
                <ShimmerSkeleton className='mt-3 h-9 w-full rounded-lg' />
              </div>
            </div>
          ))}
        </div>
      </AdvancedShimmer>
    </div>
  );
}

/**
 * Enterprise Dead Stock Identification Skeleton
 */
export function DeadStockSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Metrics row */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <AdvancedShimmer key={i} className='h-28 rounded-xl p-4'>
            <div className='space-y-3'>
              <ShimmerSkeleton className='h-4 w-32' />
              <ShimmerSkeleton className='h-8 w-16' />
              <div className='h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-green-400 to-blue-400'
                  style={{ width: `${60 + Math.random() * 30}%` }}
                />
              </div>
            </div>
          </AdvancedShimmer>
        ))}
      </div>

      {/* Chart area */}
      <AdvancedShimmer className='h-64 rounded-xl p-6'>
        <div className='space-y-4'>
          <ShimmerSkeleton className='h-5 w-48' />
          <div className='flex items-end justify-between gap-2 pt-6'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className='flex flex-1 flex-col items-center gap-2'>
                <ShimmerSkeleton
                  className='w-full'
                  style={{ height: `${40 + Math.random() * 120}px` }}
                />
                <ShimmerSkeleton className='h-3 w-6' />
              </div>
            ))}
          </div>
        </div>
      </AdvancedShimmer>

      {/* Dead stock items list */}
      <AdvancedShimmer className='rounded-xl p-6'>
        <div className='space-y-3'>
          <ShimmerSkeleton className='h-6 w-40' />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='rounded-lg border border-slate-200 p-4 dark:border-slate-800'
            >
              <div className='flex items-center justify-between gap-4'>
                <div className='flex-1 space-y-2'>
                  <ShimmerSkeleton className='h-4 w-32' />
                  <ShimmerSkeleton className='h-3 w-48' />
                </div>
                <ShimmerSkeleton className='h-6 w-20 rounded-full' />
              </div>
            </div>
          ))}
        </div>
      </AdvancedShimmer>
    </div>
  );
}

/**
 * Enterprise Suppliers Lead Time Skeleton
 */
export function SuppliersSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex flex-wrap gap-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerSkeleton key={i} className='h-10 w-32 rounded-lg' />
        ))}
      </div>

      {/* Supplier cards grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <AdvancedShimmer
            key={i}
            className='h-72 rounded-xl border border-slate-200 p-5 dark:border-slate-800'
          >
            <div className='space-y-4'>
              {/* Supplier header */}
              <div className='flex items-start justify-between'>
                <div className='flex-1 space-y-2'>
                  <ShimmerSkeleton className='h-6 w-40' />
                  <ShimmerSkeleton className='h-4 w-32' />
                </div>
                <ShimmerSkeleton className='h-8 w-8 shrink-0 rounded-lg' />
              </div>

              {/* Performance metrics */}
              <div className='space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800'>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className='flex items-center justify-between'>
                    <ShimmerSkeleton className='h-3 w-20' />
                    <ShimmerSkeleton className='h-5 w-12' />
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className='space-y-1'>
                <ShimmerSkeleton className='h-3 w-24' />
                <div className='h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800'>
                  <div
                    className='h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400'
                    style={{ width: `${50 + Math.random() * 40}%` }}
                  />
                </div>
              </div>

              {/* Action button */}
              <ShimmerSkeleton className='mt-2 h-9 w-full rounded-lg' />
            </div>
          </AdvancedShimmer>
        ))}
      </div>
    </div>
  );
}

/**
 * Enterprise ABC Analysis Skeleton
 */
export function ABCAnalysisSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Summary statistics */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <AdvancedShimmer key={i} className='h-28 rounded-lg p-4'>
            <div className='space-y-2'>
              <ShimmerSkeleton className='h-4 w-20' />
              <ShimmerSkeleton className='h-7 w-24' />
              <ShimmerSkeleton className='h-3 w-32' />
            </div>
          </AdvancedShimmer>
        ))}
      </div>

      {/* Main chart area */}
      <AdvancedShimmer className='h-80 rounded-xl p-6'>
        <div className='space-y-4'>
          <ShimmerSkeleton className='h-6 w-48' />
          <div className='flex items-end justify-between gap-3 pt-8'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='flex flex-1 flex-col items-center gap-2'>
                <ShimmerSkeleton
                  className='w-full rounded-t-lg'
                  style={{ height: `${80 - i * 15}px` }}
                />
                <ShimmerSkeleton className='h-4 w-12' />
              </div>
            ))}
          </div>
        </div>
      </AdvancedShimmer>

      {/* ABC Categories breakdown */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <AdvancedShimmer
            key={i}
            className='rounded-xl border border-slate-200 p-5 dark:border-slate-800'
          >
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <ShimmerSkeleton className='h-6 w-6 rounded' />
                <ShimmerSkeleton className='h-5 w-20' />
              </div>
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className='text-sm'>
                  <ShimmerSkeleton className='mb-1 h-3 w-32' />
                  <ShimmerSkeleton className='h-4 w-16' />
                </div>
              ))}
            </div>
          </AdvancedShimmer>
        ))}
      </div>

      {/* Items table */}
      <AdvancedShimmer className='overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800'>
        <div className='h-12 border-b border-slate-200 px-4 py-3 dark:border-slate-800'>
          <div className='flex items-center gap-4'>
            <ShimmerSkeleton className='h-5 w-5' />
            {Array.from({ length: 4 }).map((_, i) => (
              <ShimmerSkeleton key={i} className='h-4 flex-1' />
            ))}
          </div>
        </div>
        <div className='divide-y divide-slate-200 dark:divide-slate-800'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='h-12 px-4 py-3'>
              <div className='flex items-center gap-4'>
                <ShimmerSkeleton className='h-5 w-5' />
                {Array.from({ length: 4 }).map((_, j) => (
                  <ShimmerSkeleton key={j} className='h-4 flex-1' />
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdvancedShimmer>
    </div>
  );
}

/**
 * Enterprise Operations Tab Complete Skeleton
 */
export function OperationsTabSkeleton() {
  const [activeTab, setActiveTab] = React.useState('stock');

  return (
    <div className='w-full space-y-6 duration-500 animate-in fade-in-50'>
      {/* Tab navigation skeleton */}
      <div className='flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 dark:border-slate-800'>
        {Array.from({ length: 5 }).map((_, i) => (
          <ShimmerSkeleton
            key={i}
            className='h-10 w-28 shrink-0 rounded-lg'
            style={{ opacity: 0.8 - i * 0.12 }}
          />
        ))}
      </div>

      {/* Tab content area - shows appropriate skeleton based on active tab */}
      <div className='pt-2'>
        <StockLevelsSkeleton />
      </div>
    </div>
  );
}
