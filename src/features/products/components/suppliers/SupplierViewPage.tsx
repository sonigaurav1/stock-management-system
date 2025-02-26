'use client';

import { notFound } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Id } from 'convex/_generated/dataModel';
import { api } from '@/../convex/_generated/api';
import { Supplier } from '../../types/supplier.types';
import SupplierForm from './SupplierForm';

// Define valid product view types
type SupplierViewType = 'new' | string;

type TSupplierViewPageProps = {
  supplierId: SupplierViewType;
};

export default function SupplierViewPage({
  supplierId
}: TSupplierViewPageProps) {
  const isNewSupplier = supplierId === 'new';

  // Query product data
  const getSupplier = useQuery(
    api.documents.getSupplierById,
    !isNewSupplier ? { id: supplierId as Id<'suppliers'> } : 'skip'
  );

  const pageTitle = isNewSupplier ? 'Create New Supplier' : 'Edit Supplier';

  // Handle loading state
  if (!isNewSupplier && getSupplier === undefined) {
    return <div>Loading...</div>;
  }

  // Handle not found or invalid ID
  if (!isNewSupplier && getSupplier === null) {
    notFound();
  }

  return (
    <SupplierForm
      initialData={!isNewSupplier ? (getSupplier as Supplier) : null}
      pageTitle={pageTitle}
    />
  );
}
