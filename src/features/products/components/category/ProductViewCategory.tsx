'use client';

import { notFound } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Id } from 'convex/_generated/dataModel';
import { api } from '@/../convex/_generated/api';
import CategoryForm from './CategoryForm';
import { Category } from '../../types/category.types';

// Define valid product view types
type CategoryViewType = 'new' | string;

type TCategoryViewPageProps = {
  categoryId: CategoryViewType;
};

export default function CategoryViewPage({
  categoryId
}: TCategoryViewPageProps) {
  const isNewCategory = categoryId === 'new';

  // Query product data
  const getCategory = useQuery(
    api.documents.getCategoryById,
    !isNewCategory ? { id: categoryId as Id<'category'> } : 'skip'
  );

  const pageTitle = isNewCategory ? 'Create New Category' : 'Edit Category';

  // Handle loading state
  if (!isNewCategory && getCategory === undefined) {
    return <div>Loading...</div>;
  }

  // Handle not found or invalid ID
  if (!isNewCategory && getCategory === null) {
    notFound();
  }

  return (
    <CategoryForm
      initialData={!isNewCategory ? (getCategory as Category) : null}
      pageTitle={pageTitle}
    />
  );
}
