import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Platform Admin',
  description: 'Platform administration and system management.'
};

const PlatformAdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default PlatformAdminLayout;
