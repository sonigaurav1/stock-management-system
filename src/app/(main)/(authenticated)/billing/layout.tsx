import type { Metadata } from 'next';
import BillingAccessGuard from './BillingAccessGuard';

export const metadata: Metadata = {
  title: 'Products: Billing',
  description: 'Manage your billing information and transactions.'
};

export default function BillingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <BillingAccessGuard>{children}</BillingAccessGuard>;
}
