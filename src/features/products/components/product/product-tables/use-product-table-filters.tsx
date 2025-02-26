'use client';

import { useState } from 'react';

export function useProductTableFilters() {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesFilter, setCategoriesFilter] = useState<
    string | ((old: string) => string)
  >('');
  const [page, setPage] = useState(1);

  const isAnyFilterActive = !!searchQuery || !!categoriesFilter;

  const resetFilters = () => {
    setSearchQuery('');
    setCategoriesFilter('');
    setFilters({});
    setPage(1);
  };

  return {
    searchQuery,
    setSearchQuery,
    categoriesFilter,
    setCategoriesFilter: (value: string | ((old: string) => string)) => {
      setCategoriesFilter(value);
    },
    page,
    setPage,
    isAnyFilterActive,
    resetFilters,
    filters,
    setFilters
  };
}
