/**
 * Card Skeleton Component
 * Shimmer loading state for cards
 */

import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
  headerLines?: number;
  contentRows?: number;
  columns?: number;
}

export function CardSkeleton({
  className,
  headerLines = 2,
  contentRows = 3,
  columns = 1
}: CardSkeletonProps) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card p-6', className)}
    >
      {/* Header */}
      <div className='mb-4 space-y-3'>
        {Array.from({ length: headerLines }).map((_, i) => (
          <div
            key={`header-${i}`}
            className='h-4 animate-shimmer rounded-md bg-slate-200 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200'
            style={{
              width: i === 0 ? '60%' : '40%'
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className='space-y-3'>
        {Array.from({ length: contentRows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className='flex gap-3'>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className='h-12 flex-1 animate-shimmer rounded-lg bg-slate-200 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200'
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
