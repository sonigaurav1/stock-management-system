import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings: Display',
  description: 'Manage display settings for your inventory management system.'
};

const DisplayLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <div className='display-layout'>{children}</div>;
};

export default DisplayLayout;
