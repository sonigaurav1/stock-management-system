'use client';

import { notFound } from 'next/navigation';
import ProductForm from './ProductForm';
import { Product } from '../../types/product.types';
import { useQuery } from 'convex/react';
import { Id } from 'convex/_generated/dataModel';
import { api } from '@/../convex/_generated/api';

// Define valid product view types
type ProductViewType = 'new' | 'view' | string;

type TProductViewPageProps = {
  productId: ProductViewType;
};

export default function ProductViewPage({ productId }: TProductViewPageProps) {
  const isNewProduct = productId === 'new';

  // Query product data
  const getProduct = useQuery(
    api.products.getProductById,
    productId === 'view'
      ? notFound()
      : isNewProduct
        ? 'skip'
        : { id: productId as Id<'products'> }
  );

  const pageTitle = isNewProduct ? 'Create New Product' : 'Edit Product';

  // Handle loading state
  if (!isNewProduct && getProduct === undefined) {
    return <div>Loading...</div>;
  }

  // Handle not found or invalid ID
  if (!isNewProduct && getProduct === null) {
    notFound();
  }

  return (
    <ProductForm
      initialData={!isNewProduct ? (getProduct as Product) : null}
      pageTitle={pageTitle}
    />
  );
}
