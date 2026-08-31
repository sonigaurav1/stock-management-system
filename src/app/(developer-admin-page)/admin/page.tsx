'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Settings,
  History,
  BarChart3,
  Shield,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PERMISSIONS } from '@/convex/lib/permissions';
import { useState } from 'react';

// Import admin components (create these if they don't exist)
import { CompanyTeamManagement } from '@/features/admin/components/CompanyTeamManagement';
import { CompanySettings } from '@/features/admin/components/CompanySettings';
import { CompanyAuditLogs } from '@/features/admin/components/CompanyAuditLogs';
import { CompanyAnalytics } from '@/features/admin/components/CompanyAnalytics';
import { PaymentVerificationPanel } from '@/features/admin/components/PaymentVerificationPanel';

/**
 * Organization Admin Dashboard
 * RBAC-enforced admin interface for company owners and managers
 */
function AdminPageContent() {
  const stats = useQuery(api.adminQueries.getAdminOrganizationStats);
  const teamActivity = useQuery(api.adminQueries.getAdminTeamActivity);
  const pendingPayments = useQuery(api.billing.getPendingPayments);
  const [activeTab, setActiveTab] = useState('overview');

  const isLoading = stats === undefined || teamActivity === undefined;

  return (
    <AdminLayout
      title='Admin Dashboard'
      subtitle='Manage your organization, team, and settings'
    >
      {/* Quick Stats */}
      <div className='mb-8 grid gap-4 md:grid-cols-4'>
        <Card className='border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm dark:from-blue-950/20 dark:to-blue-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between text-sm font-medium'>
              <span>Active Members</span>
              <Users className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? '...' : stats?.activeMembers || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              Accepted invitations
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-sm dark:from-amber-950/20 dark:to-amber-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between text-sm font-medium'>
              <span>Pending Invites</span>
              <AlertCircle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? '...' : stats?.pendingInvitations || 0}
            </div>
            <p className='text-xs text-muted-foreground'>Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card className='border-0 bg-gradient-to-br from-green-50 to-green-100/50 shadow-sm dark:from-green-950/20 dark:to-green-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between text-sm font-medium'>
              <span>Total Members</span>
              <Users className='h-4 w-4 text-green-600 dark:text-green-400' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? '...' : stats?.totalMembers || 0}
            </div>
            <p className='text-xs text-muted-foreground'>All team members</p>
          </CardContent>
        </Card>

        <Card className='border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-sm dark:from-purple-950/20 dark:to-purple-900/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between text-sm font-medium'>
              <span>Organization</span>
              <Shield className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? '...' : stats?.organizationName?.split(' ')[0]}
            </div>
            <p className='text-xs text-muted-foreground'>Your organization</p>
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
          <TabsTrigger value='team' className='gap-2'>
            <Users className='h-4 w-4' />
            <span className='hidden sm:inline'>Team</span>
          </TabsTrigger>
          <TabsTrigger value='payments' className='gap-2'>
            <CreditCard className='h-4 w-4' />
            <span className='hidden sm:inline'>Payments</span>
          </TabsTrigger>
          <TabsTrigger value='audit' className='gap-2'>
            <History className='h-4 w-4' />
            <span className='hidden sm:inline'>Audit Logs</span>
          </TabsTrigger>
          <TabsTrigger value='settings' className='gap-2'>
            <Settings className='h-4 w-4' />
            <span className='hidden sm:inline'>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <CompanyAnalytics />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value='team' className='space-y-6'>
          <CompanyTeamManagement />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value='payments' className='space-y-6'>
          <PaymentVerificationPanel />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value='audit' className='space-y-6'>
          <CompanyAuditLogs />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value='settings' className='space-y-6'>
          <CompanySettings />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard requiredPermission={PERMISSIONS.ADMIN_MANAGE_USERS}>
      <AdminPageContent />
    </AdminGuard>
  );
}
