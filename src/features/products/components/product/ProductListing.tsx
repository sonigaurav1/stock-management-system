'use client';

import { DataTable as ProductTable } from '@/components/ui/table/ProductDataTable';
import { columns, skeletonColumns } from './product-tables/columns';
import { useEffect, useState } from 'react';
import { ProductFilters as ProductFiltersType } from 'convex/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductQuery } from '../../hooks/useProductQuery';
import ProductTableAction from './product-tables/ProductTableAction';
import { ColumnDef } from '@tanstack/react-table';
import { productSkeletonData } from '../../constants/skeletonData.product';

// ProductListingPage.tsx
export default function ProductListingPage() {
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Debounce search term to prevent excessive queries
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const { products, totalPages, totalItems, isFetching } = useProductQuery(
    { page, pageSize },
    { ...filters, searchTerm: debouncedSearchTerm }
  );
  // eslint-disable-next-line no-console
  console.log('filters', filters);
  // eslint-disable-next-line no-console
  console.log('product', products);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className='w-full space-y-4 overflow-hidden lg:px-4'>
      <ProductTableAction
        filters={filters}
        setFilters={setFilters}
        setPage={setPage}
      />
      <ProductTable
        columns={isFetching ? (skeletonColumns as ColumnDef<any>[]) : columns}
        data={isFetching ? productSkeletonData : products}
        totalItems={totalItems}
        pagination={{
          page,
          pageSize,
          totalPages,
          onPageChange: setPage,
          onPageSizeChange: setPageSize
        }}
      />
    </div>
  );
}
