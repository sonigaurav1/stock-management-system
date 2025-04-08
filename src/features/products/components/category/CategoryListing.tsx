'use client';

import { useEffect, useState, useTransition } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useCategoryQuery } from '../../hooks/useCategoryQuery';
import { CategoryDataTable } from '@/components/ui/table/CategoryDataTable';
import { Input } from '@/components/ui/input';
import { categorySkeletonData } from '../../constants/skeletonData.category';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { columns, skeletonColumns } from './category-tables/columns';

type CategoryFiltersType = {
  searchTerm?: string;
};

// ProductListingPage.tsx
export default function CategoryListingPage() {
  const [filters, setFilters] = useState<CategoryFiltersType>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Debounce search term to prevent excessive queries
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const { category, totalPages, totalItems, isFetching } = useCategoryQuery(
    { page, pageSize },
    { ...filters, searchTerm: debouncedSearchTerm }
  );

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className='w-full space-y-4 overflow-hidden lg:px-4'>
      <CategoryFilters
        filters={filters}
        onFilterChange={setFilters}
        setPage={setPage}
      />

      <CategoryDataTable
        columns={isFetching ? (skeletonColumns as ColumnDef<any>[]) : columns}
        data={isFetching ? categorySkeletonData : category}
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

// Filters component
function CategoryFilters({
  filters,
  onFilterChange,
  setPage
}: {
  filters: CategoryFiltersType;
  onFilterChange: (filters: CategoryFiltersType) => void;
  setPage: (page: number) => void;
}) {
  const [isLoading, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    startTransition(() => {
      onFilterChange({
        ...filters,
        searchTerm: value
      });
      setPage(1); // Reset page to 1 when search changes
    });
  };

  return (
    <div className='flex gap-4 rounded-lg shadow'>
      <Input
        type='text'
        placeholder='Search category...'
        value={filters.searchTerm ?? ''}
        onChange={(e) => handleSearch(e.target.value)}
        className={cn('w-full md:max-w-sm', isLoading && 'animate-pulse')}
      />
    </div>
  );
}
