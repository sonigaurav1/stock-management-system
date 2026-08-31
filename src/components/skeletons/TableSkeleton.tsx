/**
 * Table Skeleton Component
 * Shimmer loading state for tables
 */

import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  className?: string;
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  className,
  columns = 4,
  rows = 5,
  showHeader = true
}: TableSkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      <div className='p-4'>
        {/* Header */}
        {showHeader && (
          <div className='mb-4 flex gap-4 border-b border-border pb-3'>
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={`header-${i}`}
                className='h-4 flex-1 animate-shimmer rounded-md bg-slate-200 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200'
                style={{ width: `${80 + Math.random() * 20}%` }}
              />
            ))}
          </div>
        )}

        {/* Rows */}
        <div className='space-y-3'>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className='flex gap-4'>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={`cell-${colIndex}`}
                  className='h-10 flex-1 animate-shimmer rounded-md bg-slate-200 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200'
                  style={{ opacity: 1 - rowIndex * 0.1 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
