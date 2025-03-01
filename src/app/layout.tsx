import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { ConvexClientProvider } from '@/features/auth/providers/ConvexProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import Providers from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'Stock Management System',
  description:
    'Effortlessly manage your business inventory with our intuitive and powerful tools.'
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={lato.className} suppressHydrationWarning>
      <body className='overflow-hidden'>
        <ConvexClientProvider>
          <Providers>
            <SpeedInsights />
            <Analytics />
            <NextTopLoader showSpinner={false} />
            <Toaster richColors />
            {children}
          </Providers>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
