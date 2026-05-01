'use client';

import type React from 'react';
import { Separator } from '@/components/ui/separator';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className='flex h-screen w-full'>
      <div className='flex w-full flex-col'>
        {/* Header - shown on all settings pages except the main dashboard */}
        <div className='border-b px-6 py-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Configure your organization, team, and preferences
          </p>
        </div>

        <main className='flex-1 overflow-y-auto'>{children}</main>
      </div>
    </div>
  );
}
