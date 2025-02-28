import FormCardSkeleton from '@/components/FormCardSkeleton';
import PageContainer from '@/components/layout/PageContainer';
import { Suspense } from 'react';
import SupplierViewPage from '@/features/products/components/suppliers/SupplierViewPage';

export const metadata = {
  title: 'Dashboard : Supplier View'
};

type PageProps = { params: Promise<{ supplierId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <SupplierViewPage supplierId={params.supplierId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
