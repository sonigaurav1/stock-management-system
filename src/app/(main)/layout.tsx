import Header from '../../components/layout/header';
import KBar from '../../components/kbar';
import AppSidebar from '../../components/layout/AppSidebar';
import { SidebarInset, SidebarProvider } from '../../components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Inventory Management System',
  description:
    'Effortlessly manage your business inventory with our intuitive and powerful tools.'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get('sidebar:state')?.value === 'false' ? false : true;

  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {/* page main content */}
          {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
