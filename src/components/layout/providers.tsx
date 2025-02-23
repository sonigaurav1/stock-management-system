'use client';

import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { EdgeStoreProvider } from '@/lib/edgestore';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EdgeStoreProvider>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        {children}
      </ThemeProvider>
    </EdgeStoreProvider>
  );
}
