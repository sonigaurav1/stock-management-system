'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock, Loader2 } from 'lucide-react';
import { usePermission } from '@/features/teams/providers/PermissionProvider';

export default function BillingAccessGuard({
  children
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isOwner, hasPermission } = usePermission();

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Check if user has permission to access billing
  // Owner has full access, otherwise check specific permissions
  const access =
    isOwner || hasPermission('manage_settings') ? 'allowed' : 'denied';

  if (access === 'denied') {
    return (
      <div className='flex min-h-[400px] items-center justify-center p-8'>
        <Card className='w-full max-w-md text-center'>
          <CardHeader>
            <div className='mb-4 flex justify-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
                <Lock className='h-6 w-6 text-destructive' />
              </div>
            </div>
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-muted-foreground'>
              You don&apos;t have permission to access the billing page. Contact
              your organization administrator to request access.
            </p>
            <Link href='/settings/users'>
              <Button variant='outline'>View Team Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
