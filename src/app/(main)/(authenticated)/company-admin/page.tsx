'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Settings,
  BarChart3,
  FileText,
  Shield,
  Loader2
} from 'lucide-react';
import { TeamMembersTab } from '@/features/admin/components/TeamMembersTab';

export default function CompanyAdminPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('team');

  if (!isLoaded || !user) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      {/* Header */}
      <div className='border-b bg-white/80 backdrop-blur-sm'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900'>
                Company Administration
              </h1>
              <p className='mt-2 text-gray-600'>
                Manage your company settings, team members, and operations
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Logged in as</p>
              <p className='text-lg font-semibold text-gray-900'>
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
          defaultValue='team'
        >
          {/* Tabs Navigation */}
          <div className='rounded-lg border bg-white'>
            <TabsList className='w-full justify-start rounded-none border-b'>
              <TabsTrigger value='team' className='gap-2 rounded-none'>
                <Users className='h-4 w-4' />
                Team Members
              </TabsTrigger>
              <TabsTrigger value='settings' className='gap-2 rounded-none'>
                <Settings className='h-4 w-4' />
                Settings
              </TabsTrigger>
              <TabsTrigger value='audit' className='gap-2 rounded-none'>
                <FileText className='h-4 w-4' />
                Audit Logs
              </TabsTrigger>
              <TabsTrigger value='security' className='gap-2 rounded-none'>
                <Shield className='h-4 w-4' />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Team Members Tab */}
          <TabsContent value='team'>
            <TeamMembersTab />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value='settings'>
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-gray-600'>
                    Company settings management coming soon. You can update your
                    company information, business details, and preferences here.
                  </p>
                  <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='rounded-lg border bg-gray-50 p-4'>
                      <h3 className='mb-2 font-semibold'>
                        Company Information
                      </h3>
                      <p className='text-sm text-gray-600'>
                        Edit company name, address, and contact info
                      </p>
                    </div>
                    <div className='rounded-lg border bg-gray-50 p-4'>
                      <h3 className='mb-2 font-semibold'>Business Details</h3>
                      <p className='text-sm text-gray-600'>
                        Update tax IDs, registration numbers, and documents
                      </p>
                    </div>
                    <div className='rounded-lg border bg-gray-50 p-4'>
                      <h3 className='mb-2 font-semibold'>
                        Billing Information
                      </h3>
                      <p className='text-sm text-gray-600'>
                        Manage billing address and payment methods
                      </p>
                    </div>
                    <div className='rounded-lg border bg-gray-50 p-4'>
                      <h3 className='mb-2 font-semibold'>Notifications</h3>
                      <p className='text-sm text-gray-600'>
                        Configure notification preferences and alerts
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value='audit'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-gray-600'>
                    Activity logs coming soon. Track all actions performed by
                    team members including inventory changes, transactions, and
                    user management activities.
                  </p>
                  <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='rounded-lg border bg-gray-50 p-4 text-center'>
                      <p className='text-lg font-semibold text-gray-900'>
                        View Activities
                      </p>
                      <p className='mt-1 text-sm text-gray-600'>
                        See all actions and changes
                      </p>
                    </div>
                    <div className='rounded-lg border bg-gray-50 p-4 text-center'>
                      <p className='text-lg font-semibold text-gray-900'>
                        Filter by Date
                      </p>
                      <p className='mt-1 text-sm text-gray-600'>
                        Search activities by date range
                      </p>
                    </div>
                    <div className='rounded-lg border bg-gray-50 p-4 text-center'>
                      <p className='text-lg font-semibold text-gray-900'>
                        Export Logs
                      </p>
                      <p className='mt-1 text-sm text-gray-600'>
                        Download audit reports in CSV/PDF
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value='security'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <p className='text-gray-600'>
                    Manage security policies and access controls for your
                    company
                  </p>

                  {/* Security Features */}
                  <div className='space-y-4'>
                    <div className='rounded-lg border p-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            Two-Factor Authentication
                          </h3>
                          <p className='mt-1 text-sm text-gray-600'>
                            Require 2FA for all team members
                          </p>
                        </div>
                        <div className='inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700'>
                          Coming Soon
                        </div>
                      </div>
                    </div>

                    <div className='rounded-lg border p-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            Session Management
                          </h3>
                          <p className='mt-1 text-sm text-gray-600'>
                            Control active sessions and login history
                          </p>
                        </div>
                        <div className='inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700'>
                          Coming Soon
                        </div>
                      </div>
                    </div>

                    <div className='rounded-lg border p-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            API Keys
                          </h3>
                          <p className='mt-1 text-sm text-gray-600'>
                            Manage API access and integrations
                          </p>
                        </div>
                        <div className='inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700'>
                          Coming Soon
                        </div>
                      </div>
                    </div>

                    <div className='rounded-lg border p-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            Dangerous Actions
                          </h3>
                          <p className='mt-1 text-sm text-gray-600'>
                            Delete account, export data, or reset settings
                          </p>
                        </div>
                        <div className='inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700'>
                          Advanced
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
