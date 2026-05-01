import React from 'react';

export const metadata = {
  title: 'Supplier Management',
  description:
    'Review supplier performance and manage vendor relationships in one place.'
};

const SupplierManagementLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default SupplierManagementLayout;
