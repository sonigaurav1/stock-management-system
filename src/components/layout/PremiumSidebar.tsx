/**
 * Premium Sidebar Component
 * Glassmorphism design with role-based visual indicators
 */

'use client';

import { useState, useCallback } from 'react';
import { useSidebar } from './SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Shield,
  User,
  Eye,
  LogOut,
  Bell,
  Search,
  Sparkles,
  Building2
} from 'lucide-react';
import { fadeInLeft, fastStagger, easings } from '@/lib/animations';
import { ROLE_CONFIG, getRoleDisplayInfo } from '@/config/role-nav-config';

// Local interface for component-level nav items with React icons
interface LocalNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  shortcut?: string;
  badge?: number;
  items?: { title: string; href: string }[];
}

const mainNavItems: LocalNavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard/overview',
    icon: LayoutDashboard,
    shortcut: '⌘+1'
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    shortcut: '⌘+2',
    items: [
      { title: 'Products', href: '/inventory/product' },
      { title: 'Categories', href: '/inventory/categories' },
      { title: 'Stock Levels', href: '/inventory/stock' }
    ]
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    shortcut: '⌘+3'
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    shortcut: '⌘+4'
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: Wallet,
    shortcut: '⌘+5',
    items: [
      { title: 'Ledger', href: '/ledger' },
      { title: 'Expenses', href: '/expenses' },
      { title: 'Invoices', href: '/invoice' }
    ]
  },
  {
    title: 'Analytics',
    href: '/dashboard/overview?tab=financial',
    icon: BarChart3,
    shortcut: '⌘+6'
  }
];

const bottomNavItems: LocalNavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings
  },
  {
    title: 'Help & Support',
    href: '/help-center',
    icon: HelpCircle
  }
];

// Role icon mapping
const roleIcons = {
  owner: Crown,
  manager: Shield,
  staff: User,
  viewer: Eye
};

interface PremiumSidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
}

export function PremiumSidebar({ className }: PremiumSidebarProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get user role from context
  const context = useQuery(api.companyAccess.getCallerContext);
  const role = context?.role ?? 'viewer';
  const roleInfo = getRoleDisplayInfo(role);
  const RoleIcon = roleIcons[role as keyof typeof roleIcons] || User;

  // Get company info
  const company = useQuery(api.companies.getCompany, {
    userId: user?.id || ''
  });

  const companyName = company?.name || 'Your Business';

  // Filter nav items based on role (simplified - just use mainNavItems as-is)
  const can = useCallback(
    (permission: string): boolean => {
      return context?.permissions?.includes(permission) ?? false;
    },
    [context?.permissions]
  );

  // Use mainNavItems directly without additional filtering
  const filteredNavItems: LocalNavItem[] = mainNavItems;

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/overview') {
      return pathname === href || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200/50 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-950/80',
          isCollapsed ? 'w-20' : 'w-64',
          className
        )}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: easings.easeOut }}
      >
        {/* Glass effect overlay */}
        <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-slate-900/50' />

        {/* Company Header */}
        <div className='relative flex h-16 items-center gap-3 border-b border-slate-200/50 px-4 dark:border-slate-800/50'>
          <motion.div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl shadow-lg',
              role === 'owner' &&
                'bg-gradient-to-br from-violet-500 to-purple-600',
              role === 'manager' &&
                'bg-gradient-to-br from-blue-500 to-indigo-600',
              role === 'staff' &&
                'bg-gradient-to-br from-emerald-500 to-teal-600',
              role === 'viewer' &&
                'bg-gradient-to-br from-slate-500 to-slate-600'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Building2 className='h-5 w-5 text-white' />
          </motion.div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className='flex flex-col'
            >
              <span className='max-w-[140px] truncate font-semibold text-slate-900 dark:text-slate-100'>
                {companyName}
              </span>
              <div className='flex items-center gap-1.5'>
                <RoleIcon className={cn('h-3 w-3', roleInfo.color)} />
                <span className={cn('text-xs font-medium', roleInfo.color)}>
                  {roleInfo.label}
                </span>
              </div>
            </motion.div>
          )}

          {/* Collapse Toggle */}
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white shadow-md hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800',
              isCollapsed && 'rotate-180'
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className='h-3 w-3' />
          </Button>
        </div>

        {/* Navigation */}
        <nav className='relative flex-1 overflow-y-auto px-3 py-4'>
          <motion.div
            className='space-y-1'
            variants={fastStagger}
            initial='initial'
            animate='animate'
          >
            {filteredNavItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasItems = item.items && item.items.length > 0;
              const isExpanded = expandedItems.includes(item.title);

              return (
                <motion.div key={item.title} variants={fadeInLeft}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {!hasItems ? (
                        <Link href={item.href}>
                          <Button
                            variant={active ? 'secondary' : 'ghost'}
                            className={cn(
                              'w-full justify-start gap-3 transition-all duration-200',
                              active &&
                                'border-l-2 border-indigo-500 bg-gradient-to-r from-indigo-500/10 to-transparent dark:from-indigo-500/20',
                              isCollapsed && 'justify-center px-2'
                            )}
                            onClick={(e) => {
                              if (hasItems) {
                                e.preventDefault();
                                toggleExpanded(item.title);
                              }
                            }}
                          >
                            <div
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-md transition-colors',
                                active
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              )}
                            >
                              <Icon className='h-4 w-4' />
                            </div>

                            {!isCollapsed && (
                              <>
                                <span
                                  className={cn(
                                    'text-sm font-medium',
                                    active
                                      ? 'text-slate-900 dark:text-slate-100'
                                      : 'text-slate-600 dark:text-slate-300'
                                  )}
                                >
                                  {item.title}
                                </span>

                                {item.badge ? (
                                  <Badge
                                    variant='secondary'
                                    className='h-5 min-w-5 rounded-full px-1.5 text-xs'
                                  >
                                    {item.badge}
                                  </Badge>
                                ) : null}

                                {/* {item.shortcut && (
                                <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 lg:inline-block">
                                  {item.shortcut}
                                </kbd>
                              )} */}

                                {hasItems && (
                                  <ChevronRight
                                    className={cn(
                                      'ml-auto h-4 w-4 text-slate-400 transition-transform',
                                      isExpanded && 'rotate-90'
                                    )}
                                  />
                                )}
                              </>
                            )}
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant={active ? 'secondary' : 'ghost'}
                          className={cn(
                            'w-full justify-start gap-3 transition-all duration-200',
                            active &&
                              'border-l-2 border-indigo-500 bg-gradient-to-r from-indigo-500/10 to-transparent dark:from-indigo-500/20',
                            isCollapsed && 'justify-center px-2'
                          )}
                          onClick={(e) => {
                            if (hasItems) {
                              e.preventDefault();
                              toggleExpanded(item.title);
                            }
                          }}
                        >
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-md transition-colors',
                              active
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400'
                            )}
                          >
                            <Icon className='h-4 w-4' />
                          </div>

                          {!isCollapsed && (
                            <>
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  active
                                    ? 'text-slate-900 dark:text-slate-100'
                                    : 'text-slate-600 dark:text-slate-300'
                                )}
                              >
                                {item.title}
                              </span>

                              {item.badge ? (
                                <Badge
                                  variant='secondary'
                                  className='h-5 min-w-5 rounded-full px-1.5 text-xs'
                                >
                                  {item.badge}
                                </Badge>
                              ) : null}

                              {/* {item.shortcut && (
                                <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 lg:inline-block">
                                  {item.shortcut}
                                </kbd>
                              )} */}

                              {hasItems && (
                                <ChevronRight
                                  className={cn(
                                    'ml-auto h-4 w-4 text-slate-400 transition-transform',
                                    isExpanded && 'rotate-90'
                                  )}
                                />
                              )}
                            </>
                          )}
                        </Button>
                      )}
                      {/* </Link> */}
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent
                        side='right'
                        className='flex items-center gap-2'
                      >
                        <span>{item.title}</span>
                        {item.shortcut && (
                          <kbd className='rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800'>
                            {item.shortcut}
                          </kbd>
                        )}
                      </TooltipContent>
                    )}
                  </Tooltip>

                  {/* Sub-items */}
                  <AnimatePresence>
                    {!isCollapsed && hasItems && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className='ml-6 overflow-hidden'
                      >
                        {item.items?.map((subItem) => (
                          <Link key={subItem.href} href={subItem.href}>
                            <Button
                              variant='ghost'
                              size='sm'
                              className={cn(
                                'w-full justify-start pl-6 text-sm',
                                pathname === subItem.href &&
                                  'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                              )}
                            >
                              {subItem.title}
                            </Button>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          <Separator className='my-4' />

          {/* Bottom Navigation */}
          <motion.div className='space-y-1' variants={fastStagger}>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant={active ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3',
                          isCollapsed && 'justify-center px-2'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            active
                              ? 'text-slate-900 dark:text-slate-100'
                              : 'text-slate-500 dark:text-slate-400'
                          )}
                        />
                        {!isCollapsed && (
                          <span className='text-sm font-medium'>
                            {item.title}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side='right'>{item.title}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </motion.div>
        </nav>

        {/* User Profile Footer */}
        <div className='relative border-t border-slate-200/50 p-4 dark:border-slate-800/50'>
          <div
            className={cn(
              'flex items-center gap-3',
              isCollapsed && 'justify-center'
            )}
          >
            <Avatar className='h-9 w-9 ring-2 ring-white dark:ring-slate-800'>
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className='bg-gradient-to-br from-indigo-500 to-purple-600 text-sm text-white'>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className='flex flex-1 flex-col overflow-hidden'>
                <span className='truncate text-sm font-medium text-slate-900 dark:text-slate-100'>
                  {user?.fullName}
                </span>
                <span className='truncate text-xs text-slate-500 dark:text-slate-400'>
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-slate-500'
              >
                <LogOut className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

export default PremiumSidebar;
