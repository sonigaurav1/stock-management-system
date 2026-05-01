import PageContainer from '@/components/layout/PageContainer';
import StockReport from '@/features/reports/components/StockReport';
import React from 'react';

const StockReportPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Stock Report</h1>
          <p className='text-muted-foreground'>
            Analyze stock valuation, inventory aging, and dead stock
          </p>
        </div>
        <StockReport />
      </section>
    </PageContainer>
  );
};

export default StockReportPage;
