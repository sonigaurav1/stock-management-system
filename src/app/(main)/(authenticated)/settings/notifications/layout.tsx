import React from 'react';

export const metadata = {
  title: 'Settings: Notifications',
  description: 'Manage your notification preferences'
};

interface NotificationLayoutProps {
  children: React.ReactNode;
}

const NotificationLayout: React.FC<NotificationLayoutProps> = ({
  children
}) => {
  return <div className='notification-layout'>{children}</div>;
};

export default NotificationLayout;
