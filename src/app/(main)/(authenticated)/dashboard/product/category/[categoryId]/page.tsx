import FormCardSkeleton from '@/components/FormCardSkeleton';
import PageContainer from '@/components/layout/PageContainer';
import { Suspense } from 'react';
import CategoryViewPage from '@/features/products/components/category/ProductViewCategory';

export const metadata = {
  title: 'Dashboard : Product View'
};

type PageProps = { params: Promise<{ categoryId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <CategoryViewPage categoryId={params.categoryId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
