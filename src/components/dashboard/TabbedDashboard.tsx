/**
 * Tabbed Dashboard Component
 * Multi-tab analytics dashboard with premium glassmorphism design
 */

'use client';

import { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Package,
  Users,
  Zap,
  Sparkles
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer, easings } from '@/lib/animations';
import { CardSkeleton } from '@/components/skeletons';

// Lazy load tab content for performance
const SummaryTab = lazy(() => import('./tabs/SummaryTab'));
const FinancialTab = lazy(() => import('./tabs/FinancialTab'));
const InventoryTab = lazy(() => import('./tabs/InventoryTab'));
const CustomersTab = lazy(() => import('./tabs/CustomersTab'));
const OperationsTab = lazy(() => import('./tabs/OperationsTab'));

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

const tabs: TabConfig[] = [
  {
    id: 'summary',
    label: 'Summary',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: Wallet,
    badge: 'New',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Zap,
    color: 'from-rose-500 to-pink-600'
  }
];

// Tab content wrapper with loading state
function TabContent({
  children,
  isActive
}: {
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <AnimatePresence mode='wait'>
      {isActive && (
        <motion.div
          key='content'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: easings.easeOut }}
        >
          <Suspense
            fallback={
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} className='h-64' />
                ))}
              </div>
            }
          >
            {children}
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface TabbedDashboardProps {
  defaultTab?: string;
  className?: string;
}

export function TabbedDashboard({
  defaultTab = 'summary',
  className
}: TabbedDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || defaultTab
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without page reload
    const params = new URLSearchParams(searchParams);
    if (value === 'summary') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tab Navigation */}
      <motion.div
        className='-mx-4 border-b border-slate-200/50 bg-white/80 px-4 pb-4 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80'
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          {/* Title */}
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20'>
              <Sparkles className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-slate-900 dark:text-slate-100'>
                Analytics Dashboard
              </h1>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Deep insights into your business performance
              </p>
            </div>
          </div>

          {/* Custom Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className='w-full sm:w-auto'
          >
            <TabsList className='grid h-10 w-full grid-cols-3 gap-1 rounded-xl bg-slate-100/80 px-1 dark:bg-slate-800/50 sm:grid-cols-5 sm:gap-2'>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      'relative flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
                    )}
                  >
                    {/* Active indicator gradient */}
                    {isActive && (
                      <motion.div
                        className={cn(
                          'absolute inset-0 rounded-lg bg-gradient-to-r opacity-10',
                          tab.color
                        )}
                        layoutId='activeTab'
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.6
                        }}
                      />
                    )}

                    <span className='relative z-10 flex items-center gap-2'>
                      <Icon className='h-4 w-4' />
                      {/* <span className="hidden sm:inline">{tab.label}</span> */}
                      {tab.badge && (
                        <Badge
                          variant='secondary'
                          className='ml-1 h-4 px-1 text-[10px]'
                        >
                          {tab.badge}
                        </Badge>
                      )}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className='min-h-[600px]'>
        <TabContent isActive={activeTab === 'summary'}>
          <SummaryTab />
        </TabContent>

        <TabContent isActive={activeTab === 'financial'}>
          <FinancialTab />
        </TabContent>

        <TabContent isActive={activeTab === 'inventory'}>
          <InventoryTab />
        </TabContent>

        <TabContent isActive={activeTab === 'customers'}>
          <CustomersTab />
        </TabContent>

        <TabContent isActive={activeTab === 'operations'}>
          <OperationsTab />
        </TabContent>
      </div>
    </div>
  );
}

export default TabbedDashboard;
