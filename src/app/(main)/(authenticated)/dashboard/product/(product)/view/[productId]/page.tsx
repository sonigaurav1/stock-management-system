/* eslint-disable import/no-unresolved */
import PageContainer from '@/components/layout/PageContainer';
import SingleProductViewPage from '@/features/products/components/product/SingleProductViewPage';

export const metadata = {
  title: 'Products: View Product'
};

type PageProps = { params: Promise<{ productId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <SingleProductViewPage productId={params.productId} />;
      </div>
    </PageContainer>
  );
}
