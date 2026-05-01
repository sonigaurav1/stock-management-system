import React from 'react';

export const metadata = {
  title: 'Invoices',
  description:
    'View, manage, and generate sales invoices from a central invoice workspace.'
};

const InvoiceLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default InvoiceLayout;
