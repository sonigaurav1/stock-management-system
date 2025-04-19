'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PATH } from '@/constants/PATH';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className='absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4 text-center'>
      <div className='flex flex-col items-center justify-center'>
        <AlertCircle className='mb-4 h-24 w-24 text-red-500' />
        <span className='bg-gradient-to-b from-red-500 to-transparent bg-clip-text text-[5rem] font-extrabold leading-none text-transparent'>
          Oops!
        </span>
        <h2 className='font-heading my-2 text-2xl font-bold'>
          Something went wrong
        </h2>
        <p className='mb-6 text-muted-foreground'>
          We encountered an unexpected error while processing your request.
          {error.digest && (
            <span className='mt-2 block text-xs'>Error ID: {error.digest}</span>
          )}
        </p>
        <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
          <Button
            onClick={() => reset()}
            variant='default'
            size='lg'
            className='w-full sm:w-auto'
          >
            Try again
          </Button>
          <Button
            onClick={() => router.push(PATH.OVERVIEW)}
            variant='ghost'
            size='lg'
            className='w-full sm:w-auto'
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
