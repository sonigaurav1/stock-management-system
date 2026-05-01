'use client';

import Link from 'next/link';
import { useMemo, useState, useCallback } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCheck,
  DollarSign,
  Package,
  TriangleAlert,
  X,
  Clock
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type NotificationTone = 'critical' | 'warning' | 'info' | 'success';

interface NotificationItem {
  _id: string;
  title: string;
  description: string;
  type: string;
  priority: NotificationTone;
  createdAt: number;
  isDismissed: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const toneStyles: Record<
  NotificationTone,
  {
    ring: string;
    icon: typeof TriangleAlert;
    bgColor: string;
  }
> = {
  critical: {
    ring: 'bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20',
    icon: TriangleAlert,
    bgColor: 'bg-rose-50 dark:bg-rose-950'
  },
  warning: {
    ring: 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20',
    icon: Package,
    bgColor: 'bg-amber-50 dark:bg-amber-950'
  },
  info: {
    ring: 'bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20',
    icon: Bell,
    bgColor: 'bg-sky-50 dark:bg-sky-950'
  },
  success: {
    ring: 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20',
    icon: DollarSign,
    bgColor: 'bg-emerald-50 dark:bg-emerald-950'
  }
};

const getTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestamp).toLocaleDateString();
};

const NotificationButton = () => {
  const [openNotifications, setOpenNotifications] = useState(false);
  const { toast } = useToast();

  // Fetch notifications from Convex
  const notifications = useQuery(api.insights.getActiveInsights, {}) || [];
  const dismissInsightMutation = useMutation(api.insights.dismissInsight);

  // Transform insights to notification format
  const formattedNotifications: NotificationItem[] = useMemo(() => {
    return (notifications || [])
      .filter((n) => !n.isDismissed)
      .slice(0, 20)
      .map((insight) => ({
        _id: insight._id || '',
        title: insight.title,
        description: insight.description,
        type: insight.type,
        priority: (insight.priority || 'info') as NotificationTone,
        createdAt: insight.createdAt,
        isDismissed: insight.isDismissed || false,
        actionUrl: insight.actionUrl,
        actionLabel: insight.actionLabel
      }));
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return formattedNotifications.filter((n) => !n.isDismissed).length;
  }, [formattedNotifications]);

  // Group notifications by priority
  const groupedByPriority = useMemo(() => {
    const grouped: Record<NotificationTone, NotificationItem[]> = {
      critical: [],
      warning: [],
      info: [],
      success: []
    };
    formattedNotifications.forEach((n) => {
      grouped[n.priority].push(n);
    });
    return grouped;
  }, [formattedNotifications]);

  const handleDismiss = useCallback(
    async (notificationId: string) => {
      try {
        await dismissInsightMutation({ insightId: notificationId });
        toast({
          title: 'Notification dismissed',
          description: 'The notification has been removed.'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to dismiss notification',
          variant: 'destructive'
        });
      }
    },
    [dismissInsightMutation, toast]
  );

  const handleDismissAll = useCallback(async () => {
    try {
      for (const notification of formattedNotifications) {
        await dismissInsightMutation({ insightId: notification._id });
      }
      toast({
        title: 'All notifications dismissed',
        description: `${formattedNotifications.length} notifications have been cleared.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss notifications',
        variant: 'destructive'
      });
    }
  }, [formattedNotifications, dismissInsightMutation, toast]);

  return (
    <Popover open={openNotifications} onOpenChange={setOpenNotifications}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-10 w-10 rounded-full border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-accent hover:shadow-md'
          aria-label={`Open notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className='h-4 w-4' />
          {unreadCount > 0 ? (
            <span className='absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={12}
        className='w-[calc(100vw-1.5rem)] overflow-hidden rounded-3xl border-border/60 bg-popover p-0 shadow-2xl sm:w-[28rem]'
      >
        {/* Header */}
        <div className='border-b border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-4 text-white'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-xs font-medium uppercase tracking-[0.24em] text-white/60'>
                Enterprise Alerts
              </p>
              <h3 className='mt-1 text-lg font-semibold'>Activity Center</h3>
              <p className='mt-1 text-sm text-white/70'>
                Real-time updates on inventory, payments, and operations.
              </p>
            </div>
            <Badge
              variant='secondary'
              className='border-white/10 bg-white/10 text-white hover:bg-white/15'
            >
              {unreadCount} active
            </Badge>
          </div>

          {/* Stats */}
          <div className='mt-4 grid grid-cols-3 gap-2 text-xs text-white/75'>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-3 py-2'>
              <div className='font-semibold text-white'>
                {formattedNotifications.length}
              </div>
              <div>Total</div>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-3 py-2'>
              <div className='font-semibold text-white'>{unreadCount}</div>
              <div>Active</div>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 px-3 py-2'>
              <div className='font-semibold text-white'>
                {groupedByPriority.critical.length > 0 ? 'Critical' : 'Stable'}
              </div>
              <div>Status</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className='flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3'>
          <p className='text-sm font-medium text-foreground'>Recent activity</p>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-8 rounded-full px-3 text-xs'
            onClick={handleDismissAll}
            disabled={formattedNotifications.length === 0}
          >
            <X className='mr-2 h-3.5 w-3.5' />
            Clear all
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className='h-[24rem]'>
          <div className='divide-y divide-border/40'>
            {formattedNotifications.length > 0 ? (
              formattedNotifications.map((notification) => {
                const tone = toneStyles[notification.priority];
                const Icon = tone.icon;

                return (
                  <div
                    key={notification._id}
                    className={cn(
                      'group relative flex gap-3 border-l-4 p-4 transition-all duration-200 hover:bg-accent/40',
                      notification.priority === 'critical'
                        ? 'border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                        : notification.priority === 'warning'
                          ? 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
                          : notification.priority === 'success'
                            ? 'border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                            : 'border-l-sky-500 bg-sky-50/30 dark:bg-sky-950/20'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                        tone.ring
                      )}
                    >
                      <Icon className='h-4 w-4' />
                    </div>

                    {/* Content */}
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-2'>
                        <div>
                          <p className='truncate text-sm font-semibold text-foreground'>
                            {notification.title}
                          </p>
                          <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                            {notification.description}
                          </p>
                        </div>
                      </div>

                      {/* Meta & Actions */}
                      <div className='mt-2 flex items-center justify-between gap-2'>
                        <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                          {notification.actionUrl ? (
                            <Button
                              asChild
                              variant='ghost'
                              size='sm'
                              className='h-7 rounded-full px-2 text-xs'
                            >
                              <Link href={notification.actionUrl}>
                                {notification.actionLabel || 'View'}
                                <ArrowRight className='ml-1 h-3 w-3' />
                              </Link>
                            </Button>
                          ) : null}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 rounded-full p-0'
                            onClick={() => handleDismiss(notification._id)}
                            title='Dismiss notification'
                          >
                            <X className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='flex min-h-[16rem] flex-col items-center justify-center px-6 text-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                  <CheckCheck className='h-5 w-5' />
                </div>
                <h4 className='mt-4 text-base font-semibold text-foreground'>
                  All caught up!
                </h4>
                <p className='mt-2 max-w-xs text-sm text-muted-foreground'>
                  No new alerts. Real-time updates on inventory, payments, and
                  operations will appear here.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className='flex items-center justify-between gap-3 bg-muted/30 px-4 py-3'>
          <p className='text-xs text-muted-foreground'>
            Notifications synchronized in real-time
          </p>
          <Button asChild variant='outline' size='sm' className='rounded-full'>
            <Link href='/settings/notifications'>
              Settings
              <ArrowRight className='ml-2 h-3.5 w-3.5' />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationButton;
