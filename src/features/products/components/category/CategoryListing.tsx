/* eslint-disable no-console */
'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useCategoryQuery } from '../../hooks/useCategoryQuery';
import { CategoryDataTable } from '@/components/ui/table/category-data-table';
import { columns, skeletonColumns } from './category-tables/columns';
import { Input } from '@/components/ui/input';
import { categorySkeletonData } from '../../constants/skeletonData.category';
import { ColumnDef } from '@tanstack/react-table';

type CategoryFiltersType = {
  searchTerm?: string;
};

// ProductListingPage.tsx
export default function CategoryListingPage() {
  const [filters, setFilters] = useState<CategoryFiltersType>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search term to prevent excessive queries
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const { category, totalPages, totalItems, isFetching } = useCategoryQuery(
    { page, pageSize },
    { searchTerm: debouncedSearchTerm }
  );

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className='space-y-4'>
      <CategoryFilters filters={filters} onFilterChange={setFilters} />

      <CategoryDataTable
        columns={isFetching ? (skeletonColumns as ColumnDef<any>[]) : columns}
        data={isFetching ? categorySkeletonData : category}
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

// Filters component
function CategoryFilters({
  filters,
  onFilterChange
}: {
  filters: CategoryFiltersType;
  onFilterChange: (filters: CategoryFiltersType) => void;
}) {
  return (
    <div className='flex gap-4 rounded-lg bg-white p-4 shadow'>
      <Input
        type='text'
        placeholder='Search category...'
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
