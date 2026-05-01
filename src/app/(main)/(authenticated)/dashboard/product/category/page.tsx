'use client';

import { useState, useRef } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import CategoryListingPage from '@/features/products/components/category/CategoryListing';
import CategoryFormDialog from '@/features/products/components/category/CategoryFormDialog';

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCategoryAdded = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <PageContainer scrollable>
      <div className='mb-10 flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Category' description='Manage categories here.' />
          <CategoryFormDialog onCategoryAdded={handleCategoryAdded} />
        </div>
        <Separator />
        <CategoryListingPage key={refreshKey} />
      </div>
    </PageContainer>
  );
}
