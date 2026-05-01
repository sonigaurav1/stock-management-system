import PageContainer from '@/components/layout/PageContainer';
import DataManagementSettings from '@/features/settings/data/components/DataManagementSettings';
import React from 'react';

const DataManagementSettingsPage = () => {
  return (
    <PageContainer scrollable>
      <section className='min-h-[calc(100dvh-52px)] w-full flex-1 space-y-4'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Data Management</h1>
          <p className='text-muted-foreground'>
            Import, export, backup, and manage your data
          </p>
        </div>
        <DataManagementSettings />
      </section>
    </PageContainer>
  );
};

export default DataManagementSettingsPage;
