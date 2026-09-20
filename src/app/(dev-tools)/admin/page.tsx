'use client';

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UsersCreatedManagement } from '@/features/admin/components/UsersCreatedManagement';
import { GlobalFeedbackManagement } from '@/features/admin/components/GlobalFeedbackManagement';
import { RegisteredCompaniesManagement } from '@/features/admin/components/RegisteredCompaniesManagement';
import { AdminOverview } from '@/features/admin/components/AdminOverview';
import { SystemMonitoring } from '@/features/admin/components/SystemMonitoring';
import {
  Users,
  MessageSquare,
  Building2,
  Activity,
  BarChart3,
  Code2,
  Zap
} from 'lucide-react';

export default function DeveloperAdminPage() {
  const stats = useQuery(api.admin.getAdminDashboardStats);

  return (
    <PageContainer scrollable>
      <div className='container mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6'>
        {/* Header Banner */}
        <div className='flex flex-col justify-between gap-4 rounded-xl border bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-md md:flex-row md:items-center'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2.5'>
              <div className='rounded-lg border border-indigo-500/30 bg-indigo-500/20 p-2 text-indigo-400'>
                <Code2 className='h-6 w-6' />
              </div>
              <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                Developer Admin Portal
              </h1>
              <Badge
                variant='outline'
                className='border-indigo-400/30 bg-indigo-500/10 text-indigo-300'
              >
                Dev Tools
              </Badge>
            </div>
            <p className='text-sm text-slate-300'>
              Developer control center for users created, user feedback, company
              management, and system monitoring.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className='flex flex-wrap items-center gap-3 pt-2 md:pt-0'>
            <div className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs'>
              <Users className='h-4 w-4 text-blue-400' />
              <span>
                Users:{' '}
                <strong className='text-white'>
                  {stats?.totalUsers ?? '...'}
                </strong>
              </span>
            </div>

            <div className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs'>
              <MessageSquare className='h-4 w-4 text-amber-400' />
              <span>
                Feedback:{' '}
                <strong className='text-white'>
                  {stats?.totalFeedback ?? '...'}
                </strong>
              </span>
            </div>

            <div className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs'>
              <Zap className='h-4 w-4 text-emerald-400' />
              <span>
                Rating:{' '}
                <strong className='text-white'>
                  {stats?.avgFeedbackRating
                    ? `${stats.avgFeedbackRating}★`
                    : 'N/A'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Main Tabs Navigation */}
        <Tabs defaultValue='users' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2 gap-1 rounded-lg bg-muted p-1 md:grid-cols-5'>
            <TabsTrigger
              value='users'
              className='flex items-center gap-2 py-2 text-xs font-medium md:text-sm'
            >
              <Users className='h-4 w-4 text-blue-500' />
              <span>Users Created</span>
            </TabsTrigger>

            <TabsTrigger
              value='feedback'
              className='flex items-center gap-2 py-2 text-xs font-medium md:text-sm'
            >
              <MessageSquare className='h-4 w-4 text-amber-500' />
              <span>User Feedback</span>
              {stats && stats.unresolvedFeedback > 0 && (
                <Badge
                  variant='destructive'
                  className='ml-1 h-5 px-1.5 text-[10px] font-bold'
                >
                  {stats.unresolvedFeedback}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value='companies'
              className='flex items-center gap-2 py-2 text-xs font-medium md:text-sm'
            >
              <Building2 className='h-4 w-4 text-purple-500' />
              <span>Companies</span>
            </TabsTrigger>

            <TabsTrigger
              value='monitoring'
              className='flex items-center gap-2 py-2 text-xs font-medium md:text-sm'
            >
              <Activity className='h-4 w-4 text-emerald-500' />
              <span>System Health</span>
            </TabsTrigger>

            <TabsTrigger
              value='overview'
              className='flex items-center gap-2 py-2 text-xs font-medium md:text-sm'
            >
              <BarChart3 className='h-4 w-4 text-indigo-500' />
              <span>Platform Growth</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Users Created */}
          <TabsContent
            value='users'
            className='space-y-4 focus-visible:outline-none'
          >
            <UsersCreatedManagement />
          </TabsContent>

          {/* Tab 2: User Feedback */}
          <TabsContent
            value='feedback'
            className='space-y-4 focus-visible:outline-none'
          >
            <GlobalFeedbackManagement />
          </TabsContent>

          {/* Tab 3: Registered Companies */}
          <TabsContent
            value='companies'
            className='space-y-4 focus-visible:outline-none'
          >
            <RegisteredCompaniesManagement />
          </TabsContent>

          {/* Tab 4: System Monitoring */}
          <TabsContent
            value='monitoring'
            className='space-y-4 focus-visible:outline-none'
          >
            <SystemMonitoring />
          </TabsContent>

          {/* Tab 5: Admin Overview & Growth */}
          <TabsContent
            value='overview'
            className='space-y-4 focus-visible:outline-none'
          >
            <AdminOverview />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
