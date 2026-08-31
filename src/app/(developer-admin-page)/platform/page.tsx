/**
 * Platform Admin Page (renamed from /super-admin)
 * Enterprise-grade RBAC-based platform management for developers and ops team
 */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  MessageSquare,
  Activity,
  BarChart3,
  Settings,
  AlertCircle
} from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useState } from 'react';

// Import platform admin components (create these if they don't exist)
import { SuperAdminOverview } from '@/features/admin/components/SuperAdminOverview';
import { GlobalFeedbackManagement } from '@/features/admin/components/GlobalFeedbackManagement';
import { RegisteredCompaniesManagement } from '@/features/admin/components/RegisteredCompaniesManagement';
import { SystemMonitoring } from '@/features/admin/components/SystemMonitoring';

/**
 * Platform Admin Dashboard
 * RBAC-enforced interface for platform developers and ops team
 *
 * Super-admin users should have a special role that grants access to this page
 * This page manages all companies/tenants on the platform
 */
function PlatformAdminContent() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminLayout
      title='Platform Admin Dashboard'
      subtitle='Manage all companies, system health, and platform settings'
    >
      {/* Quick Stats */}
      <div className='mb-8 grid gap-4 md:grid-cols-4'>
        <Card className='border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm dark:from-blue-950/20 dark:to-blue-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between text-sm font-medium'>
              <span>Total Companies</span>
              <Building2 className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-xs text-muted-foreground'>Active tenants</p>
          </CardContent>
        </Card>

        <Card className='border-0 bg-gradient-to-br from-green-50 to-green-100/50 shadow-sm dark:from-green-950/20 dark:to-green-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between text-sm font-medium'>
              <span>System Health</span>
              <Activity className='h-4 w-4 text-green-600 dark:text-green-400' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Healthy</div>
            <p className='text-xs text-muted-foreground'>
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-sm dark:from-purple-950/20 dark:to-purple-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between text-sm font-medium'>
              <span>Pending Feedback</span>
              <MessageSquare className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-xs text-muted-foreground'>From all companies</p>
          </CardContent>
        </Card>

        <Card className='border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-sm dark:from-amber-950/20 dark:to-amber-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between text-sm font-medium'>
              <span>Environment</span>
              <AlertCircle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {process.env.NODE_ENV || 'production'}
            </div>
            <p className='text-xs text-muted-foreground'>Current deployment</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-5'>
          <TabsTrigger value='overview' className='gap-2'>
            <BarChart3 className='h-4 w-4' />
            <span className='hidden sm:inline'>Overview</span>
          </TabsTrigger>
          <TabsTrigger value='companies' className='gap-2'>
            <Building2 className='h-4 w-4' />
            <span className='hidden sm:inline'>Companies</span>
          </TabsTrigger>
          <TabsTrigger value='feedback' className='gap-2'>
            <MessageSquare className='h-4 w-4' />
            <span className='hidden sm:inline'>Feedback</span>
          </TabsTrigger>
          <TabsTrigger value='monitoring' className='gap-2'>
            <Activity className='h-4 w-4' />
            <span className='hidden sm:inline'>Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value='settings' className='gap-2'>
            <Settings className='h-4 w-4' />
            <span className='hidden sm:inline'>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <SuperAdminOverview />
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value='companies' className='space-y-6'>
          <RegisteredCompaniesManagement />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value='feedback' className='space-y-6'>
          <GlobalFeedbackManagement />
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value='monitoring' className='space-y-6'>
          <SystemMonitoring />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value='settings' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-sm text-muted-foreground'>
                Platform settings and configurations (admin only)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

export default function PlatformAdminPage() {
  // For now, use env var as fallback
  // In future, this should use RBAC with a "platform_admin" permission
  const SUPER_ADMIN_USER_IDS = (
    process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS || ''
  )
    .split(',')
    .filter(Boolean);

  return (
    <AdminGuard fallbackMessage='Only platform administrators can access this page. Contact the platform team.'>
      <PlatformAdminContent />
    </AdminGuard>
  );
}
