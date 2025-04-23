import React from 'react';

export const metadata = {
  title: 'Settings: Account',
  description: 'Manage your account settings and preferences.'
};

const AccountLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <>{children}</>;
};

export default AccountLayout;
