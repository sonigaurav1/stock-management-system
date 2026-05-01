import PageContainer from '@/components/layout/PageContainer';
import BillingSettings from '@/features/settings/billing/components/BillingSettings';
import React from 'react';

const BillingSettingsPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Billing & Subscription
          </h1>
          <p className='text-muted-foreground'>
            Manage your subscription plan, billing information, and invoices
          </p>
        </div>
        <BillingSettings />
      </section>
    </PageContainer>
  );
};

export default BillingSettingsPage;
