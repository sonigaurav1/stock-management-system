'use client';
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import InvoiceDocument from './InvoiceDocument';
import { InvoiceProps } from '../interfaces/IBilling';

export default function PDFViewerComponent({
  invoiceData
}: {
  invoiceData: InvoiceProps['invoiceData'];
}) {
  return (
    <PDFViewer width='100%' height='100%' showToolbar={false}>
      <InvoiceDocument invoiceData={invoiceData} />
    </PDFViewer>
  );
}
