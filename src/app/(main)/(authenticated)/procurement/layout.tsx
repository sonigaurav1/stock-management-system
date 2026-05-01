import React from 'react';

export const metadata = {
  title: 'Procurement',
  description:
    'Manage suppliers and purchasing operations from a single procurement workspace.'
};

const ProcurementLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default ProcurementLayout;
