import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import SupplierListingPage from '@/features/products/components/suppliers/SupplierListing';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard: Suppliers'
};

export default async function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Suppliers' description='Manage suppliers here.' />
          <Link
            href='/dashboard/product/supplier/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New Supplier
          </Link>
        </div>
        <Separator />
        <SupplierListingPage />
      </div>
    </PageContainer>
  );
}
