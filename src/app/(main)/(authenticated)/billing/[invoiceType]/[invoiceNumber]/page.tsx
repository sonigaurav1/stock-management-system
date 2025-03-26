import PageContainer from '@/components/layout/PageContainer';
import InvoiceViewer from '@/features/billing/components/InvoiceViewer';
import React from 'react';

type PageProps = {
  params: Promise<{ invoiceType: string; invoiceNumber: string }>;
};

const InvoicePage = async (props: PageProps) => {
  const params = await props.params;
  const { invoiceType, invoiceNumber } = params;

  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4 px-60'>
        <InvoiceViewer
          invoiceType={invoiceType}
          invoiceNumber={invoiceNumber}
        />
      </section>
    </PageContainer>
  );
};

export default InvoicePage;
