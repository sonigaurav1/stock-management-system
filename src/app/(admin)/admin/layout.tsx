import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Manage your stock and inventory efficiently.'
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default AdminLayout;
