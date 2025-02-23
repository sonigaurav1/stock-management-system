'use client';

import { DataTable as ProductTable } from '@/components/ui/table/data-table';
import { columns } from './product-tables/columns';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useProductTableFilters } from './product-tables/use-product-table-filters';
import { useEffect, useState } from 'react';
import { Product } from '../types/product.types';

type ProductListingPage = {};

export default function ProductListingPage({}: ProductListingPage) {
  const { searchQuery, categoriesFilter, page } = useProductTableFilters();

  // State to track initial fetch
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);

  // Fetch paginated products only on first render
  const paginatedProducts = useQuery(api.documents.getPaginatedProducts, {
    paginationOptions: {
      page: 1,
      pageSize: 10
    }
  });

  // Fetch filtered products if search params change
  const filteredProducts = useQuery(
    searchQuery
      ? api.documents.searchProducts
      : api.documents.getProductsByCategory,
    searchQuery
      ? { searchTerm: searchQuery, paginationOptions: { page, pageSize: 10 } }
      : {
          category: categoriesFilter,
          paginationOptions: { page, pageSize: 10 }
        }
  );

  // Determine which products to display
  const [productsToShow, setProductsToShow] = useState<Product[]>([]);

  useEffect(() => {
    // Set products from initial fetch if not done yet
    if (!isInitialFetchDone && paginatedProducts?.products) {
      setProductsToShow(paginatedProducts.products);
      setIsInitialFetchDone(true);
    } else if (isInitialFetchDone && filteredProducts?.products) {
      // Update products if filters change
      setProductsToShow(filteredProducts.products);
    }
  }, [paginatedProducts, filteredProducts, isInitialFetchDone]);

  const totalItems =
    (isInitialFetchDone
      ? filteredProducts?.products
      : paginatedProducts?.products
    )?.length || 0;

  return (
    <div>
      <ProductTable
        columns={columns}
        data={productsToShow}
        totalItems={totalItems}
      />
    </div>
  );
}

{
  /**
  "use client"
import { DataTable as ProductTable } from '@/components/ui/table/data-table';
import { columns } from './product-tables/columns';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';

type ProductListingPage = {};

export default function ProductListingPage({}: ProductListingPage) {
  const getPaginatedProducts = useQuery(api.documents.getPaginatedProducts, {
      paginationOptions: {
        page: 1,
        pageSize: 10
      }
    });

  return (
    <ProductTable
      columns={columns}
      data={getPaginatedProducts?.products || []}
      totalItems={getPaginatedProducts?.products.length || 0}
    />
  );
} 
 */
}
