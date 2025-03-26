'use client';

import type React from 'react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Settings, Bell, Monitor, CreditCard } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const settingsNavItems = [
    {
      title: 'Profile',
      href: '/settings/profile',
      icon: User
    },
    {
      title: 'Account',
      href: '/settings/account',
      icon: CreditCard
    },
    {
      title: 'Appearance',
      href: '/settings/appearance',
      icon: Monitor
    },
    {
      title: 'Notifications',
      href: '/settings/notifications',
      icon: Bell
    },
    {
      title: 'Display',
      href: '/settings/display',
      icon: Settings
    }
  ];

  return (
    <div className='flex h-screen w-full'>
      <div className='flex w-full flex-col'>
        <div className='px-4 py-6'>
          <div className='space-y-6'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
              <p className='text-muted-foreground'>
                Manage your account settings and set e-mail preferences.
              </p>
            </div>
            <Separator />
          </div>
        </div>

        <div className='flex flex-1'>
          <aside className='hidden w-1/5 border-r px-4 py-4 lg:block'>
            <nav className='space-y-1'>
              {settingsNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className='mr-2 h-4 w-4' />
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>

          <main className='min-h-screen w-full overflow-y-auto'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
