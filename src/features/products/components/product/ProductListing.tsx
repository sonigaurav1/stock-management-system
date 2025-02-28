/* eslint-disable no-console */
'use client';

import { DataTable as ProductTable } from '@/components/ui/table/ProductDataTable';
import { columns, skeletonColumns } from './product-tables/Columns';
import { useEffect, useState } from 'react';
import { ProductFilters as ProductFiltersType } from 'convex/documents';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductQuery } from '../../hooks/useProductQuery';
import ProductTableAction from './product-tables/ProductTableAction';
import { ColumnDef } from '@tanstack/react-table';
import { productSkeletonData } from '../../constants/skeletonData.product';

// ProductListingPage.tsx
export default function ProductListingPage() {
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search term to prevent excessive queries
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const { products, totalPages, totalItems, isFetching } = useProductQuery(
    { page, pageSize },
    { ...filters, searchTerm: debouncedSearchTerm }
  );

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className='space-y-4'>
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
          onPageChange: setPage
        }}
      />
    </div>
  );
}
