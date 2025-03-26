'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@radix-ui/react-scroll-area';

export default function AppearancePage() {
  return (
    <ScrollArea className='h-[calc(100dvh-200px)] flex-1'>
      <div className='md: flex-1 px-4 py-2 md:px-6 lg:px-8 lg:py-4'>
        <div className='max-w-3xl'>
          <div>
            <h2 className='text-xl font-bold'>Appearance</h2>
            <p className='text-sm text-muted-foreground'>
              Customize the appearance of the app. Automatically switch between
              themes based on system preferences.
            </p>
          </div>

          <div className='mt-6 space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Theme</h3>
              <RadioGroup defaultValue='system'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='light' id='light' />
                  <Label htmlFor='light'>Light</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='dark' id='dark' />
                  <Label htmlFor='dark'>Dark</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='system' id='system' />
                  <Label htmlFor='system'>System</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Font Size</h3>
              <RadioGroup defaultValue='medium'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='small' id='small' />
                  <Label htmlFor='small'>Small</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='medium' id='medium' />
                  <Label htmlFor='medium'>Medium</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='large' id='large' />
                  <Label htmlFor='large'>Large</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <Button>Save preferences</Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
