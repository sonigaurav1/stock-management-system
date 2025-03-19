// InvoicePreview.jsx
import dynamic from 'next/dynamic';
import React from 'react';

const PDFViewerNoSSR = dynamic(() => import('./PDFViewerComponent'), {
  ssr: false
});

export default function InvoicePreview() {
  return (
    <div className='mx-auto max-w-4xl p-5'>
      <h1 className='mb-6 text-2xl font-bold'>Invoice Preview</h1>
      <div className='mb-6'>
        <PDFViewerNoSSR />
      </div>
      {/* Preview info remains as is */}
    </div>
  );
}
