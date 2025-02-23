'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';

export const CATEGORY_OPTIONS = [
  { value: 'Bulb', label: 'Bulb' },
  { value: 'TV', label: 'TV' },
  { value: 'Iron', label: 'Iron' },
  { value: 'Fridge', label: 'Fridge' },
];

export function useProductTableFilters() {
  // Similar to your existing implementation, include logic for managing filters
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    searchParams.q.withDefault("")
  );
  const [categoriesFilter, setCategoriesFilter] = useQueryState(
    "categories",
    searchParams.categories.withDefault("")
  );
  const [page, setPage] = useQueryState("page", searchParams.page.withDefault(1));

  return {
    searchQuery,
    setSearchQuery,
    categoriesFilter,
    setCategoriesFilter,
    page,
    setPage,
  };
}

