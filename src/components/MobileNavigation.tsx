'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  LayoutDashboard,
  FileText,
  Settings,
  ShoppingCart
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function MobileNavigation() {
  const pathname = usePathname();
  const { theme } = useTheme();

  // Google Play style - simplified to 3 main navigation items
  const routes = [
    {
      name: 'Dashboard',
      href: '/dashboard/overview',
      icon: LayoutDashboard
    },
    {
      name: 'Products',
      href: '/dashboard/product',
      icon: ShoppingCart
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard
    },
    {
      name: 'Ledger',
      href: '/ledger',
      icon: FileText
    },
    {
      name: 'Settings',
      href: '/settings/profile',
      icon: Settings
    }
  ];

  return (
    <div className='fixed bottom-0 left-0 z-50 w-full border-t bg-background text-foreground md:hidden'>
      <div className='flex h-16 items-center justify-around'>
        {routes.map((route) => {
          const isActive = pathname.startsWith(route.href);

          return (
            <Link
              key={route.name}
              href={route.href}
              className={cn(
                'flex w-1/3 flex-col items-center justify-center',
                isActive ? 'text-blue-600' : 'text-gray-600'
              )}
            >
              <route.icon
                className={cn(
                  'mb-1 h-6 w-6',
                  isActive ? 'text-blue-600' : 'text-gray-600'
                )}
                fill={isActive && theme === 'light' ? 'white' : 'none'}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-blue-600' : 'text-gray-600'
                )}
              >
                {route.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
