import { api } from '@/../convex/_generated/api';
import { PaginationOptions, ProductFilters } from 'convex/types';
import { useQuery } from 'convex/react';

// Frontend hook for managing category queries
export const useCategoryQuery = (
  paginationOptions: PaginationOptions,
  filters: ProductFilters
) => {
  const result = useQuery(api.categories.getFilteredCategory, {
    paginationOptions,
    filters: {
      searchTerm: filters.searchTerm?.trim() || undefined
    }
  });

  return {
    category: result?.category ?? [],
    totalPages: result?.totalPages ?? 0,
    currentPage: result?.currentPage ?? 1,
    totalItems: result?.totalItems ?? 0,
    isFetching: result === undefined
  };
};
