'use client';

import PageContainer from '@/components/layout/PageContainer';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Plus, TrendingUp, Users, Package, Star } from 'lucide-react';
import SupplierListingPage from '@/features/products/components/suppliers/SupplierListing';
import SupplierFormDialog from '@/features/products/components/suppliers/SupplierFormDialog';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useState } from 'react';

export default function Page() {
  const metrics = useQuery(api.suppliers.getSupplierMetrics);
  const [open, setOpen] = useState(false);

  return (
    <PageContainer scrollable>
      <div className='mb-10 flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Suppliers'
            description='Manage suppliers, track performance, and optimize procurement relationships.'
          />
          {/* Add Supplier Dialog */}
          <SupplierFormDialog
            open={open}
            onOpenChange={setOpen}
            onSupplierAdded={() => {
              // Optionally refresh data here
            }}
          />
        </div>
        <Separator />

        {/* Supplier Metrics */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Total Suppliers</span>
                <Users className='size-4 text-muted-foreground' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {metrics?.totalSuppliers ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Active Suppliers</span>
                <TrendingUp className='size-4 text-green-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {metrics?.activeSuppliers ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Products Sourced</span>
                <Package className='size-4 text-muted-foreground' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {metrics?.suppliersByUsage?.reduce(
                  (sum, s) => sum + s.productCount,
                  0
                ) ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Top Supplier</span>
                <Star className='size-4 text-amber-500' />
              </CardDescription>
              <CardTitle className='truncate text-lg'>
                {metrics?.topSuppliers?.[0]?.name ?? 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                {metrics?.topSuppliers?.[0]?.productCount ?? 0} products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Table */}
        <SupplierListingPage />
      </div>
    </PageContainer>
  );
}
