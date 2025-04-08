// components/SharePdfButton.tsx
import React, { useState } from 'react';

interface SharePdfButtonProps {
  pdfUrl: string | (() => Promise<string>);
  title: string;
  fileName?: string;
}

const SharePdfButton: React.FC<SharePdfButtonProps> = ({
  pdfUrl,
  title,
  fileName = 'invoice.pdf'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the Web Share API is available (mostly on mobile)
  const isWebShareSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.share &&
    // Check if sharing files is supported (not all mobile browsers support this)
    navigator.canShare &&
    navigator.canShare({ files: [new File([''], 'test.txt')] });

  // Check if we're on mobile but file sharing isn't supported
  const isMobileWithoutFileShare =
    typeof navigator !== 'undefined' &&
    !!navigator.share &&
    (!navigator.canShare ||
      !navigator.canShare({ files: [new File([''], 'test.txt')] }));

  const handleShare = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For mobile devices with full Web Share API support (including file sharing)
      if (isWebShareSupported) {
        // Fetch the PDF file
        const resolvedPdfUrl =
          typeof pdfUrl === 'function' ? await pdfUrl() : pdfUrl;
        const response = await fetch(resolvedPdfUrl);
        const blob = await response.blob();

        // Create a File object from the blob
        const file = new File([blob], fileName, { type: 'application/pdf' });

        // Check if we can share this specific file
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title,
            files: [file]
          });
        } else {
          throw new Error('This file cannot be shared on this device');
        }
      }
      // For mobile devices with Web Share API but without file sharing support
      else if (isMobileWithoutFileShare) {
        // Share just the URL instead of the file
        await navigator.share({
          title: title,
          text: `${title} - View or download this invoice`,
          url: window.location.href // Share the current page URL
        });
      }
      // Fallback for desktop: download the PDF
      else {
        const link = document.createElement('a');
        const resolvedPdfUrl =
          typeof pdfUrl === 'function' ? await pdfUrl() : pdfUrl;
        link.href = resolvedPdfUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error sharing PDF:', err);
      setError('Failed to share. Please try downloading instead.');

      // Fallback to direct download if sharing fails
      try {
        const link = document.createElement('a');
        const resolvedPdfUrl =
          typeof pdfUrl === 'function' ? await pdfUrl() : pdfUrl;
        link.href = resolvedPdfUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setError(null); // Clear error if download succeeds
      } catch (downloadErr) {
        setError('Failed to share or download PDF. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleShare}
        disabled={isLoading}
        type='button'
        aria-label='Share or download invoice'
        className='flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
        style={{ minHeight: '44px' }} // Ensure touchable area is large enough on mobile
      >
        {isLoading ? (
          <span className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='mr-2 h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
            />
          </svg>
        )}
        {isWebShareSupported
          ? 'Share Invoice'
          : isMobileWithoutFileShare
            ? 'Share Link'
            : 'Download Invoice'}
      </button>
      {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
    </div>
  );
};

export default SharePdfButton;
