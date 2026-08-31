/**
 * Chart Skeleton Component
 * Shimmer loading state for charts
 */

import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
}

export function ChartSkeleton({
  className,
  aspectRatio = 'video'
}: ChartSkeletonProps) {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]'
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {/* Shimmer overlay */}
      <div className='absolute inset-0 animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]' />

      {/* Placeholder chart lines */}
      <div className='absolute inset-0 flex items-end justify-between p-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='w-full rounded-t-sm bg-slate-300/50'
            style={{
              height: `${20 + Math.random() * 60}%`,
              marginLeft: i === 0 ? 0 : '8px'
            }}
          />
        ))}
      </div>
    </div>
  );
}
