/* eslint-disable no-console */
'use client';

import { DataTable as ProductTable } from '@/components/ui/table/data-table';
import { columns } from './product-tables/columns';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useProductTableFilters } from './product-tables/use-product-table-filters';
import { useEffect, useState } from 'react';
import { Product } from '../types/product.types';

type ProductListingPage = {};

const dummy = [
  {
    _creationTime: 1737807245270.8022,
    _id: 'j978c9q9g71txyqr3vycs3dqsh792bhv',
    category: 'Bulb',
    description: 'Best bulb of the year',
    imageUrl:
      'https://files.edgestore.dev/s2x7c04grr9cjf03/publicFiles/_public/ecc9bf6e-22df-4f0c-bb3e-66378c4b07e7.jpg',
    name: 'Bulb',
    price: 120,
    quantity: 60
  },
  {
    _creationTime: 1737812421809.53,
    _id: 'j9760xffm3fmnecg2wkgp45tx97934ms',
    category: 'Fridge',
    description: 'Best Fridge of the year',
    imageUrl:
      'https://files.edgestore.dev/s2x7c04grr9cjf03/publicFiles/_public/6d3191ad-9b87-40b2-80a3-60019e2aaef0.jpg',
    name: 'Fridge',
    price: 25000,
    quantity: 45
  },
  {
    _creationTime: 1737812464255.0493,
    _id: 'j97fxc9hq3y8zkp1vhhj3rh7v1793cmq',
    category: 'Washing Machine',
    description: 'Best washing machine of the year',
    imageUrl:
      'https://files.edgestore.dev/s2x7c04grr9cjf03/publicFiles/_public/10239aed-eb3b-4932-bd65-1a53219cea86.jpg',
    name: 'Washing Machine',
    price: 12000,
    quantity: 25
  },
  {
    _creationTime: 1737813059544.3147,
    _id: 'j975kczf55bxvj0m7e3h9hnwgd793kj2',
    category: 'TV',
    description: 'Best TV of the year',
    imageUrl:
      'https://files.edgestore.dev/s2x7c04grr9cjf03/publicFiles/_public/22894d53-e392-44fb-84ee-94da195ddbb2.webp',
    name: 'TV',
    price: 15000,
    quantity: 18
  },
  {
    _creationTime: 1740210833135.329,
    _id: 'j974ne5b2h1xqw29fb2j837zc57avgk5',
    category: 'Bulb',
    description: 'Best bulb of the year',
    imageUrl:
      'https://files.edgestore.dev/s2x7c04grr9cjf03/publicFiles/_public/dc55489f-02df-4ee3-984c-08d626b55c04.jpeg',
    name: 'Bulb',
    price: 120,
    quantity: 60
  }
];

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
    console.debug('Filtered Products:', filteredProducts);
    console.debug('Paginated Products:', paginatedProducts);

    if (!isInitialFetchDone && paginatedProducts?.products) {
      setProductsToShow(paginatedProducts.products);
      setIsInitialFetchDone(true);
    } else if (isInitialFetchDone && filteredProducts?.products) {
      setProductsToShow(filteredProducts.products);
    }
  }, [paginatedProducts, filteredProducts, isInitialFetchDone]);

  console.debug('Products to Show:', productsToShow);

  const totalItems = isInitialFetchDone
    ? (filteredProducts?.totalPages ?? 0) * 10
    : (paginatedProducts?.totalPages ?? 0) * 10;

  return (
    <div>
      <ProductTable
        columns={columns}
        data={dummy}
        totalItems={totalItems}
      />
    </div>
  );
}
