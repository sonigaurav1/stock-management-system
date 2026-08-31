import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard: Overview',
  description:
    'View your business analytics and performance metrics at a glance'
};

export default function OverviewLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
