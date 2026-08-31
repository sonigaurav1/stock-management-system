import KBar from '../../components/kbar';
import { PremiumSidebar } from '../../components/layout/PremiumSidebar';
import { PremiumHeader } from '../../components/layout/PremiumHeader';
import { SidebarProvider } from '../../components/layout/SidebarContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventory Management System',
  description:
    'Effortlessly manage your business inventory with our intuitive and powerful tools.'
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <KBar>
      <SidebarProvider>
        <div className='flex min-h-screen'>
          <PremiumSidebar />
          <div className='flex flex-1 flex-col pl-20 lg:pl-64'>
            <PremiumHeader />
            <main className='flex-1 overflow-y-auto p-6'>{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </KBar>
  );
}
