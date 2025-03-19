// PDFViewerComponent.jsx
'use client';
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import InvoiceDocument from './InvoiceDocument';

export default function PDFViewerComponent({
  invoiceData
}: {
  invoiceData: any;
}) {
  return (
    <PDFViewer width='100%' height='100%' showToolbar={false}>
      <InvoiceDocument invoiceData={invoiceData} />
    </PDFViewer>
  );
}
