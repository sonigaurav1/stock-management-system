import PageContainer from '@/components/layout/PageContainer';
import ApiSettings from '@/features/settings/api/components/ApiSettings';
import React from 'react';

const ApiSettingsPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>API & Webhooks</h1>
          <p className='text-muted-foreground'>
            Manage API keys, webhooks, and integrations for developers
          </p>
        </div>
        <ApiSettings />
      </section>
    </PageContainer>
  );
};

export default ApiSettingsPage;
