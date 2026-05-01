'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Settings,
  Building2,
  MessageSquare,
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { SuperAdminOverview } from '@/features/admin/components/SuperAdminOverview';
import { GlobalFeedbackManagement } from '@/features/admin/components/GlobalFeedbackManagement';
import { RegisteredCompaniesManagement } from '@/features/admin/components/RegisteredCompaniesManagement';
import { SystemMonitoring } from '@/features/admin/components/SystemMonitoring';

export default function SuperAdminPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your super admin user ID(s)
    const SUPER_ADMIN_USER_IDS = (
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS || ''
    ).split(',');

    if (user?.id && SUPER_ADMIN_USER_IDS.includes(user.id)) {
      setIsSuperAdmin(true);
    } else {
      setIsSuperAdmin(false);
    }

    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [user]);

  if (!isSuperAdmin) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-center text-red-500'>
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-center'>
              You do not have super-admin access to this page.
            </p>
            <Button
              onClick={() => signOut()}
              variant='destructive'
              size='lg'
              className='w-full'
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
            <div>
              <h1 className='text-4xl font-bold tracking-tight'>
                Super Admin Dashboard
              </h1>
              <p className='mt-1 text-muted-foreground'>
                Platform management and system monitoring
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Avatar className='h-12 w-12'>
                <AvatarImage
                  src={user?.imageUrl}
                  alt={user?.fullName || 'Admin'}
                />
                <AvatarFallback>
                  {user?.firstName?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium'>
                  {user?.fullName || 'Super Admin'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {user?.emailAddresses[0]?.emailAddress ||
                    'admin@platform.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8'>
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='mb-8 grid w-full grid-cols-5'>
            <TabsTrigger value='overview' className='gap-2'>
              <TrendingUp className='h-4 w-4' />
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
            <Card className='border-0 shadow-sm'>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Global API Rate Limit
                      </label>
                      <div className='flex gap-2'>
                        <input
                          type='number'
                          placeholder='Requests per second'
                          defaultValue='1000'
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Max Companies
                      </label>
                      <div className='flex gap-2'>
                        <input
                          type='number'
                          placeholder='Maximum allowed'
                          defaultValue='10000'
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        defaultChecked
                        className='h-4 w-4 rounded'
                      />
                      <span className='text-sm font-medium'>
                        Enable new company registrations
                      </span>
                    </label>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        defaultChecked
                        className='h-4 w-4 rounded'
                      />
                      <span className='text-sm font-medium'>
                        Enable automatic backups
                      </span>
                    </label>
                    <label className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        defaultChecked
                        className='h-4 w-4 rounded'
                      />
                      <span className='text-sm font-medium'>
                        Send system alerts to admins
                      </span>
                    </label>
                  </div>

                  <div className='pt-4'>
                    <button
                      type='button'
                      className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dangerous Actions */}
            <Card className='border-0 border-red-500/20 bg-red-50/50 shadow-sm dark:bg-red-950/20'>
              <CardHeader>
                <CardTitle className='text-red-600 dark:text-red-400'>
                  Dangerous Actions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <button className='block w-full rounded-md border border-red-500/50 px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400'>
                  ⚠️ Force Platform Maintenance Mode
                </button>
                <button className='block w-full rounded-md border border-red-500/50 px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400'>
                  ⚠️ Clear All Cache
                </button>
                <button className='block w-full rounded-md border border-red-500/50 px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400'>
                  ⚠️ Export Platform Database
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
