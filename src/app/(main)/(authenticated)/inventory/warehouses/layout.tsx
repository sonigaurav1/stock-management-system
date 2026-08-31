import React from 'react';

export const metadata = {
  title: 'Locations',
  description: 'Multi-location inventory, transfers, dashboards, and reporting.'
};

export default function LocationsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
