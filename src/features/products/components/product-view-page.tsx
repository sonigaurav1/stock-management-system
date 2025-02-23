/* eslint-disable no-console */
'use client';

import { notFound } from 'next/navigation';
import ProductForm from './product-form';
import { Product } from '../types/product.types';
import { useQuery } from 'convex/react';
import { Id } from 'convex/_generated/dataModel';
import { api } from 'convex/_generated/api';

type TProductViewPageProps = {
  productId: string;
};

export default function ProductViewPage({ productId }: TProductViewPageProps) {
  // Always call the hook unconditionally
  const getProduct = useQuery(
    api.documents.getProductById,
    productId !== 'new'
      ? { id: productId as Id<'products'> }
      : 'skip' // Pass "skip" to avoid running the query
  );

  const pageTitle = productId === 'new' ? 'Create New Product' : 'Edit Product';

  // Handle loading state
  if (productId !== 'new' && getProduct === undefined) {
    return <div>Loading...</div>;
  }

  // Handle not found or invalid ID
  if (productId !== 'new' && getProduct === null) {
    notFound();
  }

  return (
    <ProductForm
      initialData={productId !== 'new' ? (getProduct as Product) : null}
      pageTitle={pageTitle}
    />
  );
}
