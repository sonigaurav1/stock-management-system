import PageContainer from '@/components/layout/PageContainer';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import ProductListingPage from '@/features/products/components/product/ProductListing';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard: Products'
};

export default async function Page() {
  return (
    <PageContainer scrollable>
      <div className='mb-10 flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Products'
            description='Manage products and inventory here.'
          />
          <Link
            href='/dashboard/product/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New Product
          </Link>
        </div>
        <Separator />
        <ProductListingPage />
      </div>
    </PageContainer>
  );
}
