/* eslint-disable no-console */
'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
// import { columns } from './category-tables/columns';
import { SupplierDataTable } from '@/components/ui/table/SupplierDataTable';
import { useSupplierQuery } from '../../hooks/useSupplierQuery';
import { columns } from './suppliers-tables/columns';
import { Input } from '@/components/ui/input';

type SupplierFiltersType = {
  searchTerm?: string;
};

// ProductListingPage.tsx
export default function SupplierListingPage() {
  const [filters, setFilters] = useState<SupplierFiltersType>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search term to prevent excessive queries
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const { suppliers, totalPages, isLoading, isFetching, totalItems } =
    useSupplierQuery({ page, pageSize }, { searchTerm: debouncedSearchTerm });

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className='space-y-4'>
      <SupplierFilters filters={filters} onFilterChange={setFilters} />

      <SupplierDataTable
        columns={columns}
        data={suppliers}
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

// Filters component
function SupplierFilters({
  filters,
  onFilterChange
}: {
  filters: SupplierFiltersType;
  onFilterChange: (filters: SupplierFiltersType) => void;
}) {
  return (
    <div className='flex gap-4 rounded-lg bg-white p-4 shadow'>
      <Input
        type='text'
        placeholder='Search supplier...'
        value={filters.searchTerm ?? ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            searchTerm: e.target.value
          })
        }
        className='w-full rounded border px-3 py-2 md:max-w-sm'
      />
    </div>
  );
}
