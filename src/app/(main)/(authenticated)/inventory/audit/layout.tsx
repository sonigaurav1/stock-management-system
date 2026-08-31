import React from 'react';

export const metadata = {
  title: 'Inventory Audit',
  description:
    'Run stock verification cycles and identify differences between physical and recorded inventory.'
};

const InventoryAuditLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default InventoryAuditLayout;
