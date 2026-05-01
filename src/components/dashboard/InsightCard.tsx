'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Insight } from '@/types/dashboard';

interface InsightCardProps {
  insight: Insight;
  onDismiss?: (insightId: string) => void;
  onClick?: () => void;
}

export function InsightCard({ insight, onDismiss, onClick }: InsightCardProps) {
  const getIconComponent = () => {
    switch (insight.icon) {
      case 'AlertCircle':
        return <AlertCircle className='h-5 w-5' />;
      case 'TrendingDown':
        return <TrendingDown className='h-5 w-5 text-red-500' />;
      case 'TrendingUp':
        return <TrendingUp className='h-5 w-5 text-green-500' />;
      case 'AlertTriangle':
        return <AlertCircle className='h-5 w-5 text-yellow-500' />;
      case 'X':
        return <X className='h-5 w-5 text-destructive' />;
      default:
        return <Info className='h-5 w-5' />;
    }
  };

  const getTypeStyles = () => {
    switch (insight.type) {
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'alert':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950';
      case 'opportunity':
        return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-950';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  const getPriorityBadgeVariant = () => {
    switch (insight.priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card
      className={`cursor-pointer p-4 transition-all hover:shadow-md ${getTypeStyles()}`}
      onClick={onClick}
    >
      <div className='flex items-start gap-3'>
        <div className='mt-0.5 flex-shrink-0'>{getIconComponent()}</div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <h3 className='text-sm font-semibold'>{insight.title}</h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {insight.description}
              </p>
            </div>

            {insight.dismissible && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss?.(insight.id);
                }}
                className='flex-shrink-0 hover:opacity-70'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          <div className='mt-2 flex items-center gap-2'>
            <Badge variant={getPriorityBadgeVariant()} className='text-xs'>
              {insight.priority}
            </Badge>

            {insight.actionLabel && insight.actionUrl && (
              <Button
                variant='outline'
                size='sm'
                className='h-6 text-xs'
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = insight.actionUrl!;
                }}
              >
                {insight.actionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
