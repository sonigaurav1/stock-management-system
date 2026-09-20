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
        <div className='flex h-screen w-full overflow-hidden bg-background'>
          <PremiumSidebar />
          <div className='flex h-full min-w-0 flex-1 flex-col overflow-hidden'>
            <PremiumHeader />
            <main className='flex-1 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-900/50 md:p-6'>
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </KBar>
  );
}
