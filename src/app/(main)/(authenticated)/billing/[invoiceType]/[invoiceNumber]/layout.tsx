import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoice Details',
  description: 'View and manage invoice details'
};

const InvoiceLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default InvoiceLayout;
