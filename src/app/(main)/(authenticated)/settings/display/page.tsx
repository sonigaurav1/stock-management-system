'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DisplayPage() {
  return (
    <ScrollArea className='h-[calc(100dvh-200px)] flex-1'>
      <div className='md: flex-1 px-4 py-2 md:px-6 lg:px-8 lg:py-4'>
        <div className='max-w-3xl'>
          <div>
            <h2 className='text-xl font-bold'>Display</h2>
            <p className='text-sm text-muted-foreground'>
              Customize how the application displays information.
            </p>
          </div>

          <div className='mt-6 space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Date Format</h3>
              <RadioGroup defaultValue='mdy'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='mdy' id='mdy' />
                  <Label htmlFor='mdy'>MM/DD/YYYY</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='dmy' id='dmy' />
                  <Label htmlFor='dmy'>DD/MM/YYYY</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='ymd' id='ymd' />
                  <Label htmlFor='ymd'>YYYY/MM/DD</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Time Format</h3>
              <RadioGroup defaultValue='12h'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='12h' id='12h' />
                  <Label htmlFor='12h'>12-hour (1:30 PM)</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='24h' id='24h' />
                  <Label htmlFor='24h'>24-hour (13:30)</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Display Options</h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='compact-view'>Compact view</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display more content with less spacing.
                    </p>
                  </div>
                  <Switch id='compact-view' />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='show-avatars'>Show avatars</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display user avatars in lists and comments.
                    </p>
                  </div>
                  <Switch id='show-avatars' defaultChecked />
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
