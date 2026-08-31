'use client';

import { useRef } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ProductListingPage from '@/features/products/components/product/ProductListing';
import ProductFormDialog from '@/features/products/components/product/ProductFormDialog';
import BulkProductFormDialog from '@/features/products/components/product/BulkProductFormDialog';
import ProductExportDialog from '@/features/products/components/product/ProductExportDialog';
import { useCan } from '@/features/auth/hooks/usePermissions';

export default function Page() {
  const productListingRef = useRef<{ refetch: () => void }>(null);
  const canExport = useCan('export_data');

  const handleProductAdded = () => {
    // Optionally refetch the product list
    productListingRef.current?.refetch?.();
  };

  return (
    <PageContainer scrollable>
      <div className='mb-10 flex flex-1 flex-col space-y-2'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Products'
            description='Manage products and inventory here.'
          />
          <div className='flex items-center gap-2'>
            {canExport && <ProductExportDialog />}
            <BulkProductFormDialog onProductsAdded={handleProductAdded} />
            <ProductFormDialog onProductAdded={handleProductAdded} />
          </div>
        </div>
        <Separator />
        <ProductListingPage />
      </div>
    </PageContainer>
  );
}
