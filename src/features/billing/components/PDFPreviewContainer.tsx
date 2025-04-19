import dynamic from 'next/dynamic';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import InvoiceDocument from './InvoiceDocument';
import type { InvoiceProps } from '../interfaces/IBilling';

// Lazy load the PDF viewer component
const PDFViewerNoSSR = dynamic(() => import('./PDFViewerComponent'), {
  ssr: false,
  loading: () => <p>Loading PDF viewer...</p>
});

interface PDFPreviewContainerProps {
  isGenerating: boolean;
  processedInvoiceData: any;
  isMobile: boolean;
}

const PDFPreviewContainer = ({
  isGenerating,
  processedInvoiceData,
  isMobile
}: PDFPreviewContainerProps) => {
  return (
    <div className='h-full w-full border-t pb-6 pt-4 md:pb-0 lg:w-1/2 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0'>
      {isGenerating && processedInvoiceData ? (
        isMobile ? (
          <div className='flex flex-col items-center justify-center space-y-4 p-4'>
            <p className='text-center text-gray-600'>
              PDF preview is not available on mobile devices. You can download
              the invoice instead.
            </p>

            <PDFDownloadLink
              document={
                <InvoiceDocument
                  invoiceData={
                    processedInvoiceData as InvoiceProps['invoiceData']
                  }
                />
              }
              fileName={`Invoice_${processedInvoiceData.buyerName}_${processedInvoiceData.invoiceNumber}.pdf`}
              className='w-full'
            >
              {({ loading }) => (
                <Button className='w-full' disabled={loading}>
                  {loading ? 'Preparing document...' : 'Download Invoice PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        ) : (
          <div className='h-full'>
            <PDFViewerNoSSR
              invoiceData={processedInvoiceData as InvoiceProps['invoiceData']}
            />
          </div>
        )
      ) : (
        <div className='flex h-[400px] items-center justify-center rounded-md bg-gray-200 sm:h-[500px] md:h-[600px] lg:h-full'>
          <p className='text-gray-500'>No invoice generated</p>
        </div>
      )}
    </div>
  );
};

export default PDFPreviewContainer;
