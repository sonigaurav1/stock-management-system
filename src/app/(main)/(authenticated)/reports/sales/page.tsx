import PageContainer from '@/components/layout/PageContainer';
import SalesReport from '@/features/reports/components/SalesReport';
import React from 'react';

const SalesReportPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Sales Report</h1>
          <p className='text-muted-foreground'>
            Analyze revenue trends, top products, and customer insights
          </p>
        </div>
        <SalesReport />
      </section>
    </PageContainer>
  );
};

export default SalesReportPage;
