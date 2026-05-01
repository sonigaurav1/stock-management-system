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
  Layers,
  Building,
  FileText,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { EnterpriseKPIDashboard } from '@/features/admin/components/EnterpriseKPIDashboard';
import { EnterpriseAnalyticsDashboard } from '@/features/admin/components/EnterpriseAnalyticsDashboard';
import { EnterpriseTeamManagement } from '@/features/admin/components/EnterpriseTeamManagement';
import { EnterpriseAuditLogs } from '@/features/admin/components/EnterpriseAuditLogs';
import { EnterpriseSystemSettings } from '@/features/admin/components/EnterpriseSystemSettings';
import { EnterpriseCompanyManagement } from '@/features/admin/components/EnterpriseCompanyManagement';
import { FeedbackForm } from '@/features/admin/components/FeedbackForm';
import { FeedbackList } from '@/features/admin/components/FeedbackList';

// Mock data - replace with actual data fetching from your Convex database
const mockCompanyDetails = {
  companyName: 'Acme Corporation',
  companyAddress: '123 Business Avenue, Tech City, 54321',
  phone: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
  email: 'contact@acmecorp.com',
  vatNumber: 'VAT12345678',
  isVerified: true,
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  urls: [
    { id: 1, value: 'https://acmecorp.com' },
    { id: 2, value: 'https://shop.acmecorp.com' }
  ]
};

export default function AdminPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your admin user ID
    const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

    if (user?.id === ADMIN_USER_ID) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [user]);

  if (!isAdmin) {
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
              You are not authorized to view this page.
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
                Enterprise Admin Dashboard
              </h1>
              <p className='mt-1 text-muted-foreground'>
                Complete system management and business intelligence
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Avatar className='h-12 w-12'>
                <AvatarImage
                  src={user?.imageUrl}
                  alt={user?.fullName || 'Admin'}
                />
                <AvatarFallback>
                  {user?.firstName?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium'>
                  {user?.fullName || 'Admin User'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {user?.emailAddresses[0]?.emailAddress || 'admin@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8'>
        <Tabs defaultValue='dashboard' className='w-full'>
          <TabsList className='mb-8 grid w-full grid-cols-8'>
            <TabsTrigger value='dashboard' className='gap-2'>
              <TrendingUp className='h-4 w-4' />
              <span className='hidden sm:inline'>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value='analytics' className='gap-2'>
              <BarChart3 className='h-4 w-4' />
              <span className='hidden sm:inline'>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value='company' className='gap-2'>
              <Building className='h-4 w-4' />
              <span className='hidden sm:inline'>Company</span>
            </TabsTrigger>
            <TabsTrigger value='team' className='gap-2'>
              <Users className='h-4 w-4' />
              <span className='hidden sm:inline'>Team</span>
            </TabsTrigger>
            <TabsTrigger value='audit' className='gap-2'>
              <Layers className='h-4 w-4' />
              <span className='hidden sm:inline'>Audit</span>
            </TabsTrigger>
            <TabsTrigger value='feedback' className='gap-2'>
              <MessageSquare className='h-4 w-4' />
              <span className='hidden sm:inline'>Feedback</span>
            </TabsTrigger>
            <TabsTrigger value='reports' className='gap-2'>
              <FileText className='h-4 w-4' />
              <span className='hidden sm:inline'>Reports</span>
            </TabsTrigger>
            <TabsTrigger value='settings' className='gap-2'>
              <Settings className='h-4 w-4' />
              <span className='hidden sm:inline'>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value='dashboard' className='space-y-6'>
            <EnterpriseKPIDashboard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value='analytics' className='space-y-6'>
            <EnterpriseAnalyticsDashboard />
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value='company' className='space-y-6'>
            <EnterpriseCompanyManagement />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value='team' className='space-y-6'>
            <EnterpriseTeamManagement />
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value='audit' className='space-y-6'>
            <EnterpriseAuditLogs />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value='feedback' className='space-y-6'>
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>
                  User Feedback
                </h2>
                <p className='text-muted-foreground'>
                  Review, respond to, and manage user feedback
                </p>
              </div>
              <FeedbackForm />
            </div>
            <FeedbackList />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value='reports' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-3'>
                  <Card className='cursor-pointer border-2 transition-colors hover:border-primary'>
                    <CardContent className='pt-6'>
                      <div className='text-center'>
                        <FileText className='mx-auto mb-2 h-8 w-8 text-blue-500' />
                        <p className='font-semibold'>Sales Report</p>
                        <p className='text-sm text-muted-foreground'>
                          Monthly & quarterly
                        </p>
                        <Button className='mt-4 w-full' size='sm'>
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className='cursor-pointer border-2 transition-colors hover:border-primary'>
                    <CardContent className='pt-6'>
                      <div className='text-center'>
                        <FileText className='mx-auto mb-2 h-8 w-8 text-green-500' />
                        <p className='font-semibold'>Inventory Report</p>
                        <p className='text-sm text-muted-foreground'>
                          Stock & valuation
                        </p>
                        <Button className='mt-4 w-full' size='sm'>
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className='cursor-pointer border-2 transition-colors hover:border-primary'>
                    <CardContent className='pt-6'>
                      <div className='text-center'>
                        <FileText className='mx-auto mb-2 h-8 w-8 text-purple-500' />
                        <p className='font-semibold'>User Analytics</p>
                        <p className='text-sm text-muted-foreground'>
                          Engagement & behavior
                        </p>
                        <Button className='mt-4 w-full' size='sm'>
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value='settings' className='space-y-6'>
            <EnterpriseSystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
