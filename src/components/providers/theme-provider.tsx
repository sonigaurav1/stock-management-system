'use client';

import * as React from 'react';
import NextThemesProvider from '@/components/layout/ThemeToggle/theme-provider';

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
