import PageContainer from '@/components/layout/PageContainer';
import UsersPermissionsPage from '@/features/teams/components/UsersPermissionsPage';
import React from 'react';

export default function UsersPermissionsSettingsPage() {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Users & permissions
          </h1>
          <p className='text-muted-foreground'>
            Role-based teams: design roles, organize departments, track
            activity, review performance, and run multi-step approvals.
          </p>
        </div>
        <UsersPermissionsPage />
      </section>
    </PageContainer>
  );
}
