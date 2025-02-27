'use client';

import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useProductTableFilters } from './use-product-table-filters';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductTableActionProps {
  filters: any;
  setFilters: (filters: any) => void;
  setPage: (page: number) => void;
}

export default function ProductTableAction({
  filters,
  setFilters,
  setPage
}: ProductTableActionProps) {
  const {
    categoriesFilter,
    setCategoriesFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setSearchQuery
  } = useProductTableFilters();

  const fetchedCategories = useQuery(api.documents.getAllCategories);

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey='product name'
        searchQuery={searchQuery}
        setSearchQuery={(value) => {
          setSearchQuery(value);
          setFilters({ ...filters, searchTerm: value });
        }}
        setPage={setPage}
      />
      <DataTableFilterBox
        filterKey='categories'
        title='Categories'
        options={(fetchedCategories ?? []).map((category) => ({
          value: category._id,
          label: category.name
        }))}
        setFilterValue={(value) => {
          setCategoriesFilter(value || '');
          setFilters({ ...filters, category: value || undefined });
          return Promise.resolve();
        }}
        filterValue={
          typeof categoriesFilter === 'string' ? categoriesFilter : ''
        }
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={() => {
          resetFilters();
          setFilters({});
        }}
      />
      <label className='flex items-center gap-2'>
        <Checkbox
          checked={filters.inStock ?? false}
          onCheckedChange={(checked: boolean) => {
            setFilters({
              ...filters,
              inStock: checked ? true : undefined
            });
          }}
        />
        <p className='cursor-pointer'>In Stock Only</p>
      </label>
    </div>
  );
}
