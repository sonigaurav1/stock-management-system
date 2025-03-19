// PDFViewerComponent.jsx
'use client';
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { invoiceData } from './__data';
import InvoiceDocument from './InvoiceDocument';

export default function PDFViewerComponent() {
  return (
    <PDFViewer width='100%' height='100%'>
      <InvoiceDocument invoiceData={invoiceData} />
    </PDFViewer>
  );
}
