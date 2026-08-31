import PageContainer from '@/components/layout/PageContainer';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ArrowRight, Briefcase, Building2, Truck } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const ProcurementPage = () => {
  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-col gap-4 pb-6'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <Briefcase className='size-5 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight'>Procurement</h1>
          </div>
          <p className='text-sm text-muted-foreground'>
            Manage supplier operations, monitor vendor performance, and keep
            purchasing workflows organized.
          </p>
        </div>

        <Separator />

        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Truck className='size-4 text-muted-foreground' />
                Suppliers
              </CardTitle>
              <CardDescription>
                View and maintain your supplier directory with contact and
                profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href='/procurement/suppliers'
                className={cn(buttonVariants(), 'w-fit')}
              >
                Open Suppliers <ArrowRight className='ml-2 size-4' />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building2 className='size-4 text-muted-foreground' />
                Supplier Management
              </CardTitle>
              <CardDescription>
                Track supplier performance, quality notes, and purchasing
                relationship health.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href='/supplier-management'
                className={cn(
                  buttonVariants({ variant: 'secondary' }),
                  'w-fit'
                )}
              >
                Open Supplier Management <ArrowRight className='ml-2 size-4' />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProcurementPage;
