import PageContainer from '@/components/layout/PageContainer';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import CategoryListingPage from '@/features/products/components/category/CategoryListing';
import Link from 'next/link';

export const metadata = {
  title: 'Products: Categories'
};

export default async function Page() {
  return (
    <PageContainer scrollable>
      <div className='mb-10 flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Category' description='Manage categories here.' />
          <Link
            href='/dashboard/product/category/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New Category
          </Link>
        </div>
        <Separator />
        <CategoryListingPage />
      </div>
    </PageContainer>
  );
}
