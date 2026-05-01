import PageContainer from '@/components/layout/PageContainer';
import FinancialReport from '@/features/reports/components/FinancialReport';
import React from 'react';

const FinancialReportPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Financial Report
          </h1>
          <p className='text-muted-foreground'>
            Analyze P&L statements, cash flow, and profitability metrics
          </p>
        </div>
        <FinancialReport />
      </section>
    </PageContainer>
  );
};

export default FinancialReportPage;
