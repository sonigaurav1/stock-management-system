'use client';

// Not in use

import React, { useEffect, useState } from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { EdgeStoreProvider } from '@/lib/edgestore';
import { useUser } from '@clerk/clerk-react';
import { Spinner } from '../Spinner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isSignedIn !== undefined) {
      setIsReady(true);
    }
  }, [isSignedIn]);

  if (!isReady) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center space-y-2'>
        <Spinner size='xl2' />
      </div>
    );
  }

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      {isSignedIn ? (
        <EdgeStoreProvider>{children}</EdgeStoreProvider>
      ) : (
        children
      )}
    </ThemeProvider>
  );
}
