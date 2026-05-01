import PageContainer from '@/components/layout/PageContainer';
import InvoiceGenerator from '@/features/billing/components/InvoiceGenerator';
import React from 'react';

const InvoiceGenerationPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Invoice Generation
          </h1>
          <p className='text-muted-foreground'>
            Create and manage sales invoices with auto-numbering
          </p>
        </div>
        <InvoiceGenerator />
      </section>
    </PageContainer>
  );
};

export default InvoiceGenerationPage;
