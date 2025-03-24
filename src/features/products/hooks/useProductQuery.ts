import { api } from '@/../convex/_generated/api';
import { PaginationOptions, ProductFilters } from 'convex/types';
import { useQuery } from 'convex/react';

// Frontend hook for managing product queries
export const useProductQuery = (
  paginationOptions: PaginationOptions,
  filters: ProductFilters
) => {
  const result = useQuery(api.products.getFilteredProducts, {
    paginationOptions,
    filters: {
      ...filters,
      searchTerm: filters.searchTerm?.trim() || undefined
    }
  });

  return {
    products: result?.products ?? [],
    totalPages: result?.totalPages ?? 0,
    currentPage: result?.currentPage ?? 1,
    totalItems: result?.totalItems ?? 0,
    isFetching: result === undefined
  };
};
