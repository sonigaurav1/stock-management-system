'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const isMainSettingsPage = pathname === '/settings';

  // Get current page title for sub-pages
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 2) {
      const currentPage = segments[segments.length - 1];
      return currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
    }
    return 'Settings';
  };

  const pageTitle = getPageTitle();

  return (
    <div className='flex h-screen w-full bg-slate-50/50 dark:bg-slate-950/50'>
      <div className='flex w-full flex-col'>
        {/* Header - Modern glassmorphism design */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='border-b border-slate-200/50 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'
        >
          <div className='flex items-center justify-between'>
            {/* FIXED LINE BELOW: Changed double quote to single quote */}
            <div className='flex items-center gap-3'>
              {!isMainSettingsPage && (
                <Link
                  href='/settings'
                  className='flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800'
                >
                  <ArrowLeft className='h-4 w-4 text-slate-600 dark:text-slate-400' />
                </Link>
              )}
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600'>
                <Settings className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                  {isMainSettingsPage ? 'Settings' : pageTitle}
                </h1>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  {isMainSettingsPage
                    ? 'Configure your organization, team, and preferences'
                    : 'Manage your settings'}
                </p>
              </div>
            </div>

            {/* Breadcrumb navigation */}
            <nav className='hidden items-center gap-2 text-sm md:flex'>
              <Link
                href='/dashboard'
                className='flex items-center gap-1.5 text-slate-600 transition-colors hover:text-primary dark:text-slate-400'
              >
                <Home className='h-4 w-4' />
                Dashboard
              </Link>
              <ChevronRight className='h-4 w-4 text-slate-400' />
              <Link
                href='/settings'
                className={cn(
                  'transition-colors hover:text-primary',
                  isMainSettingsPage
                    ? 'font-semibold text-primary'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                Settings
              </Link>
              {!isMainSettingsPage && (
                <>
                  <ChevronRight className='h-4 w-4 text-slate-400' />
                  <span className='font-semibold text-primary'>
                    {pageTitle}
                  </span>
                </>
              )}
            </nav>
          </div>
        </motion.div>

        {/* Main content area */}
        <motion.main
          variants={fadeInUp}
          initial='initial'
          animate='animate'
          className='flex-1 overflow-y-auto'
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
