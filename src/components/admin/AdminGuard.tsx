/**
 * AdminGuard Component
 * RBAC-based access control for admin pages
 * Replaces fragile env var auth with enterprise-grade permission checks
 */

'use client';

import { ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/nextjs';
import { AlertCircle } from 'lucide-react';

interface AdminGuardProps {
  /**
   * Component to render if access is allowed
   */
  children: ReactNode;

  /**
   * Required permission to access this admin page
   * @default 'manage_organization' for company admin
   * @example 'manage_organization' for /admin
   * @example 'manage_users' for team management
   */
  requiredPermission?: string;

  /**
   * Custom fallback message if access is denied
   */
  fallbackMessage?: string;

  /**
   * Whether to show loading state
   */
  showLoading?: boolean;
}

export function AdminGuard({
  children,
  requiredPermission = 'manage_organization',
  fallbackMessage,
  showLoading = true
}: AdminGuardProps) {
  const { can, isLoading, role } = useUserRole();
  const { signOut } = useClerk();

  // Loading state
  if (isLoading && showLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
      </div>
    );
  }

  // Access denied
  if (!can(requiredPermission)) {
    return (
      <div className='flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4'>
        <Card className='w-full max-w-md border-destructive/20 bg-destructive/5'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-destructive/10 p-2'>
                <AlertCircle className='h-5 w-5 text-destructive' />
              </div>
              <CardTitle className='text-destructive'>Access Denied</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                {fallbackMessage ||
                  `You don't have permission to access this page. Your current role is "${role}" which does not have the "${requiredPermission}" permission.`}
              </p>
              <p className='text-xs text-muted-foreground'>
                Only organization owners and managers with the required
                permissions can access admin pages.
              </p>
            </div>
            <Button
              onClick={() => signOut()}
              variant='destructive'
              size='lg'
              className='w-full'
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}
