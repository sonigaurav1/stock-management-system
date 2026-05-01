import PageContainer from '@/components/layout/PageContainer';
import SecuritySettings from '@/features/settings/security/components/SecuritySettings';
import React from 'react';

const SecuritySettingsPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Security & Compliance
          </h1>
          <p className='text-muted-foreground'>
            Manage security settings, audit logs, and compliance features
          </p>
        </div>
        <SecuritySettings />
      </section>
    </PageContainer>
  );
};

export default SecuritySettingsPage;
