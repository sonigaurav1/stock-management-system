// Shared types for better type safety
export type PaginationOptions = {
  page: number;
  pageSize: number;
};

export type ProductFilters = {
  category?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};
