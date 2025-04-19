'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function AccountPage() {
  return (
    <ScrollArea className='h-[calc(100dvh-175px)] flex-1'>
      <div className='md: flex-1 px-4 py-2 pb-28 md:px-6 md:pb-0 lg:px-8 lg:py-4'>
        <div className='max-w-3xl'>
          <div>
            <h2 className='text-xl font-bold'>Account</h2>
            <p className='text-sm text-muted-foreground'>
              Update your account settings and change your password
            </p>
          </div>

          <div className='mt-6 space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Email Address</h3>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value='example@gmail.com'
                  disabled
                />
              </div>
              <Button variant='outline'>Change email</Button>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Password</h3>
              <div className='space-y-2'>
                <Label htmlFor='current-password'>Current password</Label>
                <Input id='current-password' type='password' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='new-password'>New password</Label>
                <Input id='new-password' type='password' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirm-password'>Confirm password</Label>
                <Input id='confirm-password' type='password' />
              </div>
              <Button>Update password</Button>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Two-factor Authentication</h3>
              <div className='flex items-center space-x-2'>
                <Switch id='2fa' />
                <Label htmlFor='2fa'>Enable two-factor authentication</Label>
              </div>
              <p className='text-sm text-muted-foreground'>
                Protect your account with an extra layer of security.
              </p>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Delete Account</h3>
              <p className='text-sm text-muted-foreground'>
                Permanently delete your account and all of your content.
              </p>
              <Button variant='destructive'>Delete account</Button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
