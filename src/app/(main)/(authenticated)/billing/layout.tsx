import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products: Billing',
  description: 'Manage your billing information and transactions.'
};

const BillingLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default BillingLayout;
