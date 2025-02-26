/* eslint-disable no-console */
'use client';

import { DataTable as ProductTable } from '@/components/ui/table/data-table';
import { columns } from './product-tables/columns';
import { useEffect, useState } from 'react';
import { ProductFilters as ProductFiltersType } from 'convex/documents';
import { useDebounce } from '@/hooks/use-debounce';
import { useProductQuery } from '../../hooks/useProductQuery';
import ProductTableAction from './product-tables/product-table-action';

type ProductListingPage = {};

// ProductListingPage.tsx
export default function ProductListingPage() {
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search term to prevent excessive queries
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const { products, totalPages, isLoading, totalItems, isFetching } =
    useProductQuery(
      { page, pageSize },
      { ...filters, searchTerm: debouncedSearchTerm }
    );

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);
  console.log(products);

  return (
    <div className='space-y-4'>
      <ProductTableAction
        filters={filters}
        setFilters={setFilters}
        setPage={setPage}
      />
      <ProductTable
        columns={columns}
        data={products}
        totalItems={totalItems}
        isLoading={isLoading}
        isFetching={isFetching}
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
