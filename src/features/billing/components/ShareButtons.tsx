import { useState } from 'react';
import InvoiceDocument from './InvoiceDocument';
import { Button } from '@/components/ui/button';
import { Share2, Download, Mail, Copy } from 'lucide-react';
import { capitalizeWords } from '@/lib/utils';

const SharePDFButton = ({ invoiceData }: any) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleShare = async (option: any) => {
    try {
      setIsSharing(true);

      // Generate the PDF blob
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <InvoiceDocument invoiceData={invoiceData} />
      ).toBlob();

      const fileName = `Invoice_${capitalizeWords(invoiceData.buyerName.split(' ').join('_'))}_${invoiceData.invoiceNumber}.pdf`;

      switch (option) {
        case 'download':
          // Create a URL for the blob and trigger download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          break;

        case 'email':
          // Create a draft email with PDF attachment using mailto
          // Note: This doesn't actually attach the PDF, it just creates a draft email
          // Most mail clients don't support file attachments via mailto links
          window.open(
            `mailto:?subject=${encodeURIComponent(`Invoice ${invoiceData.invoiceNumber}`)}&body=${encodeURIComponent(`Please find attached the invoice for ${invoiceData.buyerName}.\n\nNote: Due to browser limitations, the PDF could not be automatically attached. Please download and attach it manually.`)}`,
            '_blank'
          );
          break;

        case 'native':
          // Try native sharing if available
          if (navigator.share && navigator.canShare && blob instanceof Blob) {
            const file = new File([blob], fileName, {
              type: 'application/pdf'
            });

            const shareData = {
              title: `Invoice ${invoiceData.invoiceNumber}`,
              text: `Invoice for ${invoiceData.buyerName}`,
              files: [file]
            };

            if (navigator.canShare(shareData)) {
              await navigator.share(shareData);
            } else {
              alert(
                "Your browser doesn't support sharing files. Try downloading instead."
              );
            }
          } else {
            alert(
              'Direct sharing is not supported in your browser. Try downloading the PDF instead.'
            );
          }
          break;

        case 'clipboard':
          // Let the user know that direct PDF copying to clipboard isn't supported
          alert(
            'Direct PDF copying to clipboard is not supported. Please download the PDF instead.'
          );
          break;

        default:
          // Default fallback is download
          const defaultUrl = URL.createObjectURL(blob);
          const defaultLink = document.createElement('a');
          defaultLink.href = defaultUrl;
          defaultLink.download = fileName;
          document.body.appendChild(defaultLink);
          defaultLink.click();
          document.body.removeChild(defaultLink);
          URL.revokeObjectURL(defaultUrl);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sharing PDF:', error);
    } finally {
      setIsSharing(false);
      setShowShareOptions(false);
    }
  };

  return (
    <div className='relative'>
      <Button
        type='button'
        className='flex w-full items-center gap-2 py-5 sm:w-auto'
        onClick={() => handleShare('native')}
        disabled={isSharing}
      >
        <Share2 size={16} />
        {isSharing ? 'Processing...' : 'Share Invoice'}
      </Button>

      {showShareOptions && (
        <div className='absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5'>
          <div className='py-1' role='menu' aria-orientation='vertical'>
            <button
              type='button'
              className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              onClick={() => handleShare('download')}
            >
              <Download className='mr-2 text-blue-500' size={16} /> Download PDF
            </button>
            <button
              type='button'
              className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              onClick={() => handleShare('native')}
            >
              <Share2 className='mr-2 text-green-500' size={16} /> Share
              (Native)
            </button>
            <button
              type='button'
              className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              onClick={() => handleShare('email')}
            >
              <Mail className='mr-2 text-gray-500' size={16} /> Email
            </button>
            <button
              type='button'
              className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              onClick={() => handleShare('clipboard')}
            >
              <Copy className='mr-2 text-gray-500' size={16} /> Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharePDFButton;
