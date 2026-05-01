import PageContainer from '@/components/layout/PageContainer';
import AutomationSettings from '@/features/settings/automation/components/AutomationSettings';
import React from 'react';

const AutomationSettingsPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Automation & Workflows
          </h1>
          <p className='text-muted-foreground'>
            Set up automated alerts, triggers, and scheduled reports
          </p>
        </div>
        <AutomationSettings />
      </section>
    </PageContainer>
  );
};

export default AutomationSettingsPage;
