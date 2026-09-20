'use client';

import PageContainer from '@/components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import SupplierListingPage from '@/features/products/components/suppliers/SupplierListing';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import React from 'react';
import { Users, TrendingUp, Package, Award, BarChart3 } from 'lucide-react';

const SupplierManagementPage = () => {
  const metrics = useQuery(api.suppliers.getSupplierMetrics);

  return (
    <PageContainer scrollable>
      <div className='mb-10 flex flex-1 flex-col space-y-4'>
        <Heading
          title='Supplier Management'
          description='Track supplier records, evaluate vendor reliability, and maintain procurement relationships.'
        />
        <Separator />

        {/* Supplier Metrics Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Total Suppliers</span>
                <Users className='size-4 text-blue-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {metrics?.totalSuppliers ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                In your supplier network
              </p>
            </CardContent>
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
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Actively supplying products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Total Products</span>
                <Package className='size-4 text-amber-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {metrics?.suppliersByUsage?.reduce(
                  (sum, s) => sum + s.productCount,
                  0
                ) ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Sourced across inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Top Supplier</span>
                <Award className='size-4 text-amber-500' />
              </CardDescription>
              <CardTitle className='truncate text-lg'>
                {metrics?.topSuppliers?.[0]?.name ?? 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                {metrics?.topSuppliers?.[0]?.productCount ?? 0} products
                supplied
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Suppliers Summary */}
        {metrics?.topSuppliers && metrics.topSuppliers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='size-5' />
                Top Suppliers by Product Volume
              </CardTitle>
              <CardDescription>
                Your most valued suppliers by number of products sourced
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {metrics.topSuppliers.map((supplier, index) => (
                  <div
                    key={supplier._id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold'>
                        {index + 1}
                      </div>
                      <div>
                        <p className='font-medium'>{supplier.name}</p>
                        {supplier.email && (
                          <p className='text-xs text-muted-foreground'>
                            {supplier.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-bold'>
                        {supplier.productCount}
                      </p>
                      <p className='text-xs text-muted-foreground'>products</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suppliers Table */}
        <SupplierListingPage />
      </div>
    </PageContainer>
  );
};

export default SupplierManagementPage;
