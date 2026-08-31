import React from 'react';

export const metadata = {
  title: 'Products: Restock',
  description: 'Manage and restock your inventory efficiently.'
};

const RestockLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default RestockLayout;
