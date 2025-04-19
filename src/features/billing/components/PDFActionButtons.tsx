import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import InvoiceDocument from './InvoiceDocument';
import SharePDFButton from './ShareButtons';
import type { InvoiceProps } from '../interfaces/IBilling';

interface PDFActionButtonsProps {
  processedInvoiceData: any;
  isMobile: boolean;
}

export const PDFActionButtons = ({
  processedInvoiceData,
  isMobile
}: PDFActionButtonsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!processedInvoiceData) return null;

  return (
    <>
      <Button asChild className='w-full py-5 text-center sm:w-auto'>
        <PDFDownloadLink
          document={
            <InvoiceDocument
              invoiceData={processedInvoiceData as InvoiceProps['invoiceData']}
            />
          }
          fileName={`Invoice_${processedInvoiceData.buyerName}_${processedInvoiceData.invoiceNumber}.pdf`}
        >
          {({ loading }) => (loading ? 'Loading...' : 'Download PDF')}
        </PDFDownloadLink>
      </Button>

      <Button
        className='w-full py-5 sm:w-auto'
        onClick={async () => {
          try {
            setIsLoading(true);
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(
              <InvoiceDocument
                invoiceData={
                  processedInvoiceData as InvoiceProps['invoiceData']
                }
              />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');

            if (printWindow) {
              printWindow.focus();
              printWindow.print();
              printWindow.onafterprint = () => {
                URL.revokeObjectURL(url);
              };
            } else {
              alert('Please allow popups for this website to print invoices.');
              URL.revokeObjectURL(url);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error generating PDF:', error);
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Print Invoice'}
      </Button>

      {!isMobile && (
        <SharePDFButton
          invoiceData={processedInvoiceData as InvoiceProps['invoiceData']}
        />
      )}
    </>
  );
};
