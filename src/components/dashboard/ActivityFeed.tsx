/**
 * Recent Activity Feed Component
 * Shows recent transactions and activities with timestamps
 */

'use client';

import { motion } from 'motion/react';
import {
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface Activity {
  id: string;
  type: 'sale' | 'purchase' | 'inventory' | 'user';
  title: string;
  description: string;
  timestamp: Date;
  amount?: number;
  status?: 'completed' | 'pending' | 'failed';
  user?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  className?: string;
  maxItems?: number;
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'sale',
    title: 'New Sale Completed',
    description: 'Order #1234 - 5 items sold',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    amount: 1250.0,
    status: 'completed',
    user: 'John Doe'
  },
  {
    id: '2',
    type: 'purchase',
    title: 'Inventory Restocked',
    description: 'Added 50 units of Product A',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    amount: 2500.0,
    status: 'completed',
    user: 'Jane Smith'
  },
  {
    id: '3',
    type: 'inventory',
    title: 'Low Stock Alert',
    description: 'Product B is running low (3 units left)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    status: 'pending'
  },
  {
    id: '4',
    type: 'user',
    title: 'New Team Member',
    description: 'Mike Johnson joined as Staff',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'completed'
  },
  {
    id: '5',
    type: 'sale',
    title: 'Sale Refunded',
    description: 'Order #1230 - Customer refund processed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    amount: -450.0,
    status: 'completed',
    user: 'John Doe'
  }
];

const activityIcons = {
  sale: ShoppingCart,
  purchase: Package,
  inventory: Package,
  user: Users
};

const activityColors = {
  sale: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400'
  },
  purchase: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  inventory: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400'
  },
  user: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    icon: 'text-violet-600 dark:text-violet-400'
  }
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function ActivityFeed({
  activities = defaultActivities,
  className,
  maxItems = 5
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card
      className={cn(
        'overflow-hidden border-slate-200/50 bg-white/80 backdrop-blur-md',
        'dark:border-slate-700/50 dark:bg-slate-900/80',
        className
      )}
    >
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-slate-50 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
            <Clock className='h-5 w-5' />
          </div>
          <div>
            <CardTitle className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
              Recent Activity
            </CardTitle>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Latest transactions and updates
            </p>
          </div>
        </div>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </CardHeader>

      <CardContent className='pt-4'>
        <motion.div
          className='space-y-4'
          variants={staggerContainer}
          initial='initial'
          animate='animate'
        >
          {displayedActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colors = activityColors[activity.type];
            const isPositiveAmount = activity.amount && activity.amount > 0;

            return (
              <motion.div
                key={activity.id}
                variants={fadeInUp}
                className='group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50'
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                    colors.bg
                  )}
                >
                  <Icon className={cn('h-5 w-5', colors.icon)} />
                </div>

                {/* Content */}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <h4 className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                        {activity.title}
                      </h4>
                      <p className='text-sm text-slate-500 dark:text-slate-400'>
                        {activity.description}
                      </p>
                    </div>

                    {activity.amount && (
                      <div
                        className={cn(
                          'flex items-center gap-1 text-sm font-medium',
                          isPositiveAmount
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        )}
                      >
                        {isPositiveAmount ? (
                          <ArrowUpRight className='h-4 w-4' />
                        ) : (
                          <ArrowDownRight className='h-4 w-4' />
                        )}
                        <span className='font-mono'>
                          ${Math.abs(activity.amount).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='mt-2 flex items-center gap-3'>
                    <span className='text-xs text-slate-400'>
                      {formatTimeAgo(activity.timestamp)}
                    </span>

                    {activity.user && (
                      <span className='text-xs text-slate-400'>
                        by {activity.user}
                      </span>
                    )}

                    {activity.status && (
                      <Badge
                        variant='secondary'
                        className={cn(
                          'text-xs',
                          activity.status === 'completed' &&
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
                          activity.status === 'pending' &&
                            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
                          activity.status === 'failed' &&
                            'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                        )}
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Button */}
        <div className='mt-4 border-t border-slate-200 pt-4 dark:border-slate-700'>
          <Button
            variant='ghost'
            className='w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          >
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;
