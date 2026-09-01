/**
 * Premium Header Component
 * Global search, notifications, and user controls with glassmorphism
 */

'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSidebar } from './SidebarContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  Command,
  Sparkles,
  Settings,
  User,
  LogOut,
  Building2,
  ChevronDown,
  Sun,
  Moon,
  PanelLeft
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Breadcrumbs } from '../breadcrumbs';
import { easings } from '@/lib/animations';

interface PremiumHeaderProps {
  className?: string;
}

export function PremiumHeader({ className }: PremiumHeaderProps) {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  // Notifications count (placeholder - implement when notifications feature is ready)
  const notifications = 0;

  // Get company info
  const company = useQuery(api.companies.getCompany, {
    userId: user?.id || ''
  });

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/50 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80',
        className
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: easings.easeOut }}
    >
      {/* Left Section */}
      <div className='flex items-center gap-4'>
        <SidebarToggle />
        <Breadcrumbs />
      </div>

      {/* Center - Global Search */}
      <div className='hidden max-w-md flex-1 md:block'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <Input
            type='text'
            placeholder='Search products, customers, invoices...'
            className='h-10 border-slate-200 bg-slate-100/50 pl-10 pr-20 text-sm placeholder:text-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:focus:bg-slate-800'
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
          <div className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1'>
            <kbd className='hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800 sm:inline-block'>
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className='flex items-center gap-2'>
        {/* Mobile Search */}
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 rounded-lg md:hidden'
          onClick={() => setSearchOpen(true)}
        >
          <Search className='h-4 w-4' />
        </Button>

        {/* AI Assistant Button */}
        <Button
          variant='ghost'
          size='sm'
          className='hidden items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 lg:flex'
        >
          <Sparkles className='h-4 w-4' />
          <span className='text-xs font-medium'>AI Assistant</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 rounded-lg'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className='h-4 w-4' />
          ) : (
            <Moon className='h-4 w-4' />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='relative h-9 w-9 rounded-lg'
            >
              <Bell className='h-4 w-4' />
              {notifications > 0 && (
                <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white ring-2 ring-white dark:ring-slate-950'>
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-80'>
            <DropdownMenuLabel className='flex items-center justify-between'>
              <span>Notifications</span>
              {notifications > 0 && (
                <Badge variant='secondary' className='text-xs'>
                  {notifications} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='py-8 text-center text-sm text-slate-500'>
              <Bell className='mx-auto mb-2 h-8 w-8 text-slate-300' />
              <p>No new notifications</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex items-center gap-2 rounded-lg px-2 hover:bg-slate-100 dark:hover:bg-slate-800'
            >
              <Avatar className='h-8 w-8 ring-2 ring-white dark:ring-slate-800'>
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className='bg-gradient-to-br from-indigo-500 to-purple-600 text-xs text-white'>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className='hidden text-left md:block'>
                <p className='text-sm font-medium leading-none'>
                  {user?.fullName}
                </p>
                <p className='text-xs text-slate-500'>
                  {company?.name || 'Your Business'}
                </p>
              </div>
              <ChevronDown className='hidden h-4 w-4 text-slate-400 md:block' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium'>{user?.fullName}</p>
                <p className='text-xs text-slate-500'>
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/settings' className='cursor-pointer'>
                <User className='mr-2 h-4 w-4' />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings/organization' className='cursor-pointer'>
                <Building2 className='mr-2 h-4 w-4' />
                Organization
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings' className='cursor-pointer'>
                <Settings className='mr-2 h-4 w-4' />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-rose-600 focus:text-rose-600'>
              <LogOut className='mr-2 h-4 w-4' />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

// Sidebar Toggle Button Component
function SidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant='outline'
      size='icon'
      className='h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
      onClick={toggleSidebar}
      aria-label='Toggle sidebar'
    >
      <PanelLeft className='h-4 w-4' />
    </Button>
  );
}

export default PremiumHeader;
