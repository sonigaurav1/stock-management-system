import PageContainer from '@/components/layout/PageContainer';
import OrganizationSettings from '@/features/settings/organization/components/OrganizationSettings';
import React from 'react';

const OrganizationSettingsPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Organization Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage company details, tax information, and business registration
          </p>
        </div>
        <OrganizationSettings />
      </section>
    </PageContainer>
  );
};

export default OrganizationSettingsPage;
