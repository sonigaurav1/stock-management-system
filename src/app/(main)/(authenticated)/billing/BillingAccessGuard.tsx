'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock, Loader2 } from 'lucide-react';

// Check if user has permission to access billing
function useBillingAccess() {
  const { user } = useUser();
  const userOrg = useQuery(api.organizations.getUserOrganizations);

  if (!user || !userOrg) return 'loading';

  const org = userOrg[0];
  if (!org) return 'loading';

  // Owner has full access
  if (org.ownerId === user.id) return 'allowed';

  // Check team member permissions
  const perms = useQuery(api.teamManagement.getUserPermissions, {
    actorKey: user.id
  });
  if (
    perms?.permissions?.has('create_transaction') ||
    perms?.permissions?.has('manage_settings')
  ) {
    return 'allowed';
  }

  return 'denied';
}

export default function BillingAccessGuard({
  children
}: {
  children: React.ReactNode;
}) {
  const access = useBillingAccess();

  if (access === 'loading') {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

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
