import { api } from '@/../convex/_generated/api';
import { PaginationOptions, ProductFilters } from 'convex/documents';
import { useQuery } from 'convex/react';

// Frontend hook for managing product queries
export const useSupplierQuery = (
  paginationOptions: PaginationOptions,
  filters: ProductFilters
) => {
  const result = useQuery(api.documents.getFilteredSupplier, {
    paginationOptions,
    filters: {
      searchTerm: filters.searchTerm?.trim() || undefined
    }
  });

  return {
    suppliers: result?.suppliers ?? [],
    totalPages: result?.totalPages ?? 0,
    currentPage: result?.currentPage ?? 1,
    totalItems: result?.totalItems ?? 0,
    isFetching: result === undefined
  };
};
