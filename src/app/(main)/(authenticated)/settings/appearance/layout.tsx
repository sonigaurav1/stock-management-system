import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings: Appearance',
  description:
    'Manage appearance settings for your inventory management system.'
};

interface AppearanceLayoutProps {
  children: React.ReactNode;
}

const AppearanceLayout: React.FC<AppearanceLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default AppearanceLayout;
