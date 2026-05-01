'use client';
import { PDFViewer } from '@react-pdf/renderer';
import { notFound } from 'next/navigation';
import React from 'react';
import InvoiceDocument from './InvoiceDocument';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { TEST_COMPANY_DETAILS } from '../constants';
import { useUser } from '@clerk/nextjs';

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
  const { user } = useUser();

  const invoiceData = useQuery(api.billing.getInvoiceByInvoiceNumber, {
    invoiceNumber
  });
  const company = useQuery(api.companies.getCompany, {
    userId: user?.id as string
  });

  if (!invoiceData) {
    return <div>Loading or no data available...</div>;
  }

  const transformedInvoiceData = {
    ...invoiceData,
    isInvoice: invoiceType === 'invoice' ? true : false,
    value: invoiceData.value ?? null,
    discount: invoiceData.discount ?? null,
    nonTaxable:
      invoiceData.nonTaxable !== undefined ? invoiceData.nonTaxable : null,
    taxableAmount: invoiceData.taxableAmount ?? null,
    vatAmount: invoiceData.vatAmount ?? null,
    totalAmount: invoiceData.totalAmount ?? null,
    amountInWords: invoiceData.amountInWords ?? '',
    vehicleNo: invoiceData.vehicleNo ?? null,
    remarks: invoiceData.remarks ?? null,
    companyName: company?.name ?? TEST_COMPANY_DETAILS.companyName,
    companyAddress: company?.address ?? TEST_COMPANY_DETAILS.companyAddress,
    phone: Array.isArray(company?.phone)
      ? company.phone.join(', ')
      : (company?.phone ?? TEST_COMPANY_DETAILS.phone),
    email: company?.email ?? TEST_COMPANY_DETAILS.email,
    vatNumber: company?.taxNumber ?? TEST_COMPANY_DETAILS.vatNumber,
    transactionDate: invoiceData.transactionDate ?? new Date().toISOString(),
    invoiceNumber: invoiceData.invoiceNumber ?? '',
    date: invoiceData.date ?? new Date().toISOString(),
    processedBy: company?.processedBy ?? 'Admin',
    isTestUser: company ? false : true
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
