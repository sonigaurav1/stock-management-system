'use client';
import { PDFViewer } from '@react-pdf/renderer';
import { notFound } from 'next/navigation';
import React from 'react';
import InvoiceDocument from './InvoiceDocument';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { COMPANY_DETAILS, TEST_COMPANY_DETAILS } from '../constants';

type InvoiceViewType = 'invoice' | 'tax-invoice' | string;

type TInvoiceViewPageProps = {
  invoiceType: InvoiceViewType;
  invoiceNumber: string;
};

const InvoiceViewer = ({
  invoiceType,
  invoiceNumber
}: TInvoiceViewPageProps) => {
  if (invoiceType !== 'invoice' && invoiceType !== 'tax-invoice') {
    notFound();
  }

  const invoiceData = useQuery(api.documents.getInvoiceByInvoiceNumber, {
    invoiceNumber
  });

  if (!invoiceData) {
    return <div>Loading or no data available...</div>;
  }
  const transformedInvoiceData = {
    ...invoiceData,
    isInvoice: invoiceType === 'invoice' ? true : false,
    value: invoiceData.value ?? null, // Ensure value is null if undefined
    discount: invoiceData.discount ?? null, // Ensure discount is null if undefined
    nonTaxable:
      invoiceData.nonTaxable !== undefined ? invoiceData.nonTaxable : null, // Explicitly handle undefined
    taxableAmount: invoiceData.taxableAmount ?? null, // Ensure taxableAmount is null if undefined
    vatAmount: invoiceData.vatAmount ?? null, // Ensure vatAmount is null if undefined
    totalAmount: invoiceData.totalAmount ?? null, // Ensure totalAmount is null if undefined
    ...(invoiceData.isAdmin === true ? COMPANY_DETAILS : TEST_COMPANY_DETAILS), // Correct usage of spread operator
    amountInWords: invoiceData.amountInWords ?? 'N/A', // Provide a default value if undefined
    vehicleNo: invoiceData.vehicleNo ?? null, // Ensure vehicleNo is null if undefined
    remarks: invoiceData.remarks ?? null // Ensure remarks is null if undefined
  };

  return (
    <>
      <PDFViewer width='100%' height='100%' showToolbar={false}>
        <InvoiceDocument invoiceData={transformedInvoiceData} />
      </PDFViewer>
    </>
  );
};

export default InvoiceViewer;
