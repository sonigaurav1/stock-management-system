'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  SkeletonTable,
  SkeletonStatsGrid
} from '@/components/skeletons/SkeletonLoaders';
import { useLoadingState } from '@/hooks/useLoadingState';
import { toast } from 'sonner';

/**
 * EXAMPLE 1: Table with Granular Loading
 *
 * Instead of full-page loader, shows table skeleton while data loads
 */
export function ProductsTableExample() {
  const products = useQuery(api.products.getAllProducts);
  const isLoadingTable = products === undefined;

  if (isLoadingTable) {
    return <SkeletonTable rows={5} columns={4} />;
  }

  return (
    <div className='rounded-lg border'>
      <table className='w-full'>
        <thead>
          <tr className='border-b'>
            <th className='px-4 py-2 text-left'>Name</th>
            <th className='px-4 py-2 text-left'>SKU</th>
            <th className='px-4 py-2 text-left'>Stock</th>
            <th className='px-4 py-2 text-left'>Price</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product: any) => (
            <tr key={product._id} className='border-b'>
              <td className='px-4 py-2'>{product.name}</td>
              <td className='px-4 py-2'>{product.sku}</td>
              <td className='px-4 py-2'>{product.quantity}</td>
              <td className='px-4 py-2'>${product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * EXAMPLE 2: Multiple Sections with Individual Loading States
 */
export function DashboardWithGranularLoading() {
  const topProducts = useQuery(api.dashboard.getTopSellingProducts);
  const isLoading = topProducts === undefined;

  return (
    <div className='space-y-6'>
      {isLoading ? (
        <SkeletonStatsGrid count={4} />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard title='Top Selling Count' value={topProducts?.length} />
        </div>
      )}
    </div>
  );
}

/**
 * EXAMPLE 3: Mutation with Granular Loading
 */
export function BulkActionsWithGranularLoading() {
  const addProduct = useMutation(api.products.createProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const { isLoading, withLoading } = useLoadingState();

  const isCreating = isLoading('create');
  const isDeleting = isLoading('delete');

  const handleCreate = withLoading('create', async () => {
    try {
      await addProduct({
        name: 'Product',
        sku: 'SKU-001',
        sellingPrice: 150,
        buyingPrice: 100,
        unit: 'pcs'
      } as any);
      toast.success('Created!');
    } catch {
      toast.error('Failed');
    }
  });

  const handleDelete = withLoading('delete', async () => {
    try {
      await deleteProduct({ id: 'prod_123' as any });
      toast.success('Deleted!');
    } catch {
      toast.error('Failed');
    }
  });

  return (
    <div className='flex gap-2'>
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className='rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50'
      >
        {isCreating ? 'Creating...' : 'Create'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className='rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50'
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value?: number }) {
  return (
    <div className='rounded-lg border p-4'>
      <p className='text-sm text-gray-500'>{title}</p>
      <p className='mt-2 text-2xl font-bold'>{value?.toLocaleString()}</p>
    </div>
  );
}
