'use client';

import { DataTableFilterBox } from '@/components/ui/table/DataTableFilterBox';
import { DataTableResetFilter } from '@/components/ui/table/DataTableResetFilter';
import { DataTableSearch } from '@/components/ui/table/DataTableSearch';
import { useProductTableFilters } from './useProductTableFilters';
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
          checked={filters.inStock === false ? true : false}
          onCheckedChange={(checked: boolean) => {
            setFilters({
              ...filters,
              inStock: checked ? false : undefined
            });
          }}
        />
        <p className='cursor-pointer'>Reorder Products</p>
      </label>
    </div>
  );
}
