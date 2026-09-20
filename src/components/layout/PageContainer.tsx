import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className='h-[calc(100dvh-52px)]'>
          <div className='mb-2 flex flex-1 p-0 pb-20 md:mb-0 md:px-0 md:pb-8'>
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div className='flex flex-1 p-4 pb-20 md:px-6 md:pb-0'>{children}</div>
      )}
    </>
  );
}
