import { Suspense } from 'react';
import AccessDeniedClient from './AccessDeniedClient';

export default function AccessDeniedPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
            <div className='mb-6 flex justify-center'>
              <div className='rounded-full bg-red-100 p-3'>
                <div className='h-8 w-8 animate-pulse rounded-full bg-red-200' />
              </div>
            </div>
            <div className='mx-auto mb-3 h-8 w-48 animate-pulse rounded bg-gray-200' />
            <div className='mx-auto mb-8 h-4 w-64 animate-pulse rounded bg-gray-200' />
          </div>
        </div>
      }
    >
      <AccessDeniedClient />
    </Suspense>
  );
}
