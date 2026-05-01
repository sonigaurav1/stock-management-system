import React from 'react';

export const metadata = {
  title: 'Inventory Forecast',
  description:
    'Analyze stock movement trends and plan future inventory requirements.'
};

const InventoryForecastLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default InventoryForecastLayout;
