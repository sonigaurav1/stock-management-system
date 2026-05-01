import PageContainer from '@/components/layout/PageContainer';
import MultiLocationPage from '@/features/locations/MultiLocationPage';
import React from 'react';

export default function LocationsPage() {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Multi-location</h1>
          <p className='text-muted-foreground'>
            Dashboards per site, inventory sync across warehouses, transfer
            history, and consolidated or local sales views.
          </p>
        </div>
        <MultiLocationPage />
      </section>
    </PageContainer>
  );
}
