'use client';

import { usePathname } from 'next/navigation';
import { usePermission } from '@/features/teams/providers/PermissionProvider';
import { Loader2, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Map of route prefixes to required permissions
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/inventory/stock': 'manage_stock',
  '/inventory/suppliers': 'manage_suppliers',
  '/inventory/supplier-management': 'manage_suppliers',
  '/finance': 'view_ledger',
  '/ledger': 'view_ledger',
  '/expenses': 'manage_expenses',
  '/sales': 'create_transaction',
  '/billing': 'manage_settings', // Restricted from staff
  '/invoice': 'create_transaction',
  '/invoice-generation': 'create_transaction',
  '/reports/sales': 'view_reports',
  '/reports/stock': 'view_reports',
  '/reports/financial': 'view_financial_reports',
  '/settings/users': 'manage_users',
  '/settings/billing': 'manage_settings',
  '/settings/company': 'manage_organization',
  '/organization': 'manage_organization',
  '/admin': 'manage_settings'
};

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, isOwner, hasPermission } = usePermission();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-indigo-500' />
      </div>
    );
  }

  // Owner always has full access
  if (isOwner) {
    return <>{children}</>;
  }

  // Find if current path matches any protected route prefix
  let requiredPermission = null;

  // Sort paths by length descending to match most specific first
  const protectedPaths = Object.keys(ROUTE_PERMISSIONS).sort(
    (a, b) => b.length - a.length
  );

  for (const path of protectedPaths) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      requiredPermission = ROUTE_PERMISSIONS[path];
      break;
    }
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className='flex h-[calc(100vh-100px)] w-full items-center justify-center bg-slate-50/50 p-8 dark:bg-slate-900/50'>
        <Card className='w-full max-w-md border-none bg-white/80 text-center shadow-lg backdrop-blur-xl dark:bg-slate-950/80'>
          <CardHeader>
            <div className='mb-4 flex justify-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
                <Lock className='h-8 w-8 text-red-600 dark:text-red-400' />
              </div>
            </div>
            <CardTitle className='text-2xl'>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <p className='text-slate-600 dark:text-slate-400'>
              You don&apos;t have the required permissions to view this page.
              Please contact your organization owner to request access.
            </p>
            <div className='flex flex-col gap-3'>
              <Link href='/dashboard/overview' className='w-full'>
                <Button className='w-full bg-indigo-600 text-white hover:bg-indigo-700'>
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
