'use client';

// app/page.tsx or pages/page.tsx
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import InvoicePreview with SSR disabled.
const InvoicePreview = dynamic(() => import('./InvoicePreview'), {
  ssr: false
});

export default function Page() {
  return (
    <div>
      <InvoicePreview />
    </div>
  );
}
