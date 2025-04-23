import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Firm: Ledger',
  description: 'View and manage ledger entries'
};

const LedgerLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default LedgerLayout;
