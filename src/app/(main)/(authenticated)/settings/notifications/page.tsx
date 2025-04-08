'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotificationsPage() {
  return (
    <ScrollArea className='h-[calc(100dvh-175px)] flex-1'>
      <div className='md: flex-1 px-4 py-2 pb-16 md:px-6 md:pb-0 lg:px-8 lg:py-4'>
        <div className='max-w-3xl'>
          <div>
            <h2 className='text-xl font-bold'>Notifications</h2>
            <p className='text-sm text-muted-foreground'>
              Configure how you receive notifications and updates.
            </p>
          </div>

          <div className='mt-6 space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Email Notifications</h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='order-updates'>Order updates</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive emails about your order status changes.
                    </p>
                  </div>
                  <Switch id='order-updates' defaultChecked />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='newsletters'>Newsletters</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive emails about new products and promotions.
                    </p>
                  </div>
                  <Switch id='newsletters' />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='account-updates'>Account updates</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive emails about your account activity.
                    </p>
                  </div>
                  <Switch id='account-updates' defaultChecked />
                </div>
              </div>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Push Notifications</h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='push-order-updates'>Order updates</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive push notifications about your order status
                      changes.
                    </p>
                  </div>
                  <Switch id='push-order-updates' defaultChecked />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='push-promotions'>Promotions</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive push notifications about promotions and deals.
                    </p>
                  </div>
                  <Switch id='push-promotions' />
                </div>
              </div>
            </div>

            <Separator />

            <Button>Save preferences</Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
