import PageContainer from '@/components/layout/PageContainer';
import React from 'react';

const RestockPage = () => {
  return (
    <PageContainer scrollable>
      <div className='flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center font-sans'>
        <h1 className='mb-4 text-3xl text-gray-800'>Coming Soon</h1>
        <p className='text-lg text-gray-600'>
          This feature will be available soon. Stay tuned for updates!
        </p>
      </div>
    </PageContainer>
  );
};

export default RestockPage;
