/**
 * Admin Layout Component
 * Provides consistent header, navigation, and styling for all admin pages
 */

'use client';

import { ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: ReactNode;
}

export function AdminLayout({
  title,
  subtitle,
  backHref,
  children
}: AdminLayoutProps) {
  const { user } = useUser();

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted/50'>
      {/* Header with Glassmorphism */}
      <div className='sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              {backHref && (
                <Link href={backHref}>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='mb-2 gap-2 text-muted-foreground hover:text-foreground'
                  >
                    <ChevronLeft className='h-4 w-4' />
                    Back
                  </Button>
                </Link>
              )}
              <div>
                <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
                {subtitle && (
                  <p className='mt-1 text-sm text-muted-foreground'>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* User info */}
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10 border border-border/50'>
                <AvatarImage
                  src={user?.imageUrl}
                  alt={user?.fullName || 'User'}
                />
                <AvatarFallback>
                  {user?.firstName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='hidden text-right sm:block'>
                <p className='text-sm font-medium'>
                  {user?.firstName || 'User'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {user?.emailAddresses[0]?.emailAddress || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 py-8'>{children}</div>
    </div>
  );
}
