// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { ConvexClientProvider } from '@/features/auth/providers/ConvexProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/sonner';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

// Metadata for SEO and social sharing
export const metadata: Metadata = {
  // metadataBase: new URL(
  //   process.env.NEXT_PUBLIC_API_URL || 'https://gaurav-sms.vercel.app'
  // ),
  title: 'Stock Management System',
  description:
    'Effortlessly manage your business inventory with our intuitive and powerful tools.'
  // keywords: [
  //   'stock management',
  //   'inventory control',
  //   'business tools',
  //   'stock tracking',
  //   'inventory management system'
  // ],
  // authors: [{ name: 'Gaurav Soni' }],
  // creator: 'NextTech',
  // publisher: 'NextTech',
  // applicationName: 'Stock Management System',
  // generator: 'Next.js',
  // referrer: 'origin-when-cross-origin',
  // robots: {
  //   index: true,
  //   follow: true,
  //   googleBot: {
  //     index: true,
  //     follow: true
  //   }
  // },
  // alternates: {
  //   canonical: '/'
  // },
  // openGraph: {
  //   type: 'website',
  //   locale: 'en_US',
  //   url: process.env.NEXT_PUBLIC_API_URL || 'https://gaurav-sms.vercel.app',
  //   title: 'Stock Management System',
  //   description:
  //     'Effortlessly manage your business inventory with our intuitive and powerful tools.',
  //   siteName: 'Stock Management System',
  //   images: [
  //     {
  //       url: '/og-image.jpg',
  //       width: 1200,
  //       height: 630,
  //       alt: 'Stock Management System'
  //     }
  //   ]
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   site: '@your_twitter_handle',
  //   title: 'Stock Management System',
  //   description:
  //     'Effortlessly manage your business inventory with our intuitive and powerful tools.',
  //   images: ['/twitter-image.jpg']
  // },
  // appleWebApp: {
  //   title: 'Stock Management System',
  //   statusBarStyle: 'black-translucent',
  //   capable: true
  // },
  // formatDetection: {
  //   telephone: true,
  //   email: true,
  //   address: true
  // },
  // appLinks: {
  //   web: {
  //     url: process.env.NEXT_PUBLIC_API_URL || 'https://gaurav-sms.vercel.app',
  //     should_fallback: true
  //   }
  // },
  // archives: [
  //   process.env.NEXT_PUBLIC_API_URL || 'https://gaurav-sms.vercel.app',
  //   'archives'
  // ],
  // assets: [
  //   process.env.NEXT_PUBLIC_API_URL || 'https://gaurav-sms.vercel.app',
  //   'assets'
  // ],
  // bookmarks: [
  //   process.env.NEXT_PUBLIC_API_URL || 'https://gaurav-sms.vercel.app',
  //   'bookmarks'
  // ],
  // category: 'Business',
  // classification: 'Inventory Management',
  // other: {
  //   'business:contact_data:street_address': 'Ramdhuni - 01',
  //   'business:contact_data:locality': 'Itahari',
  //   'business:contact_data:region': 'Sunsari',
  //   'business:contact_data:postal_code': '56709',
  //   'business:contact_data:country_name': 'Nepal',
  //   'fb:app_id': 'YOUR_FACEBOOK_APP_ID',
  //   'article:published_time': '2025-04-01T00:00:00Z',
  //   'article:modified_time': '2025-04-01T00:00:00Z',
  //   'article:author': 'Gaurav Soni',
  //   'article:section': 'Business',
  //   'article:tag': 'stock management'
  // }
};

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={lato.className} suppressHydrationWarning>
      {/* 
       <head>
        // {/* Favicon and App Icons - these can't be added via metadata in Next.js 13+ 
        <link rel='shortcut icon' href='/favicon.ico' />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link
          rel='apple-touch-icon'
          sizes='152x152'
          href='/apple-touch-icon-152x152.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon-180x180.png'
        />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#000000' />
        {/* <link rel='manifest' href='/site.webmanifest' /> */}

      {/* Apple Splash Screens
        <link
          rel='apple-touch-startup-image'
          media='(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
          href='/splash/apple-splash-1125-2436.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
          href='/splash/apple-splash-750-1334.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)'
          href='/splash/apple-splash-1242-2208.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)'
          href='/splash/apple-splash-2048-2732.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)'
          href='/splash/apple-splash-1668-2388.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)'
          href='/splash/apple-splash-1668-2224.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)'
          href='/splash/apple-splash-1536-2048.png'
        />

        {/* DNS Prefetch 
        <link rel='dns-prefetch' href='//cdnjs.cloudflare.com' />
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />

        {/* Preload Critical Resources 
        <link
          rel='preload'
          href='/fonts/your-main-font.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
      </head> */}
      <body className='overflow-hidden bg-background text-foreground antialiased'>
        <ConvexClientProvider>
          <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
            <SpeedInsights />
            <Analytics />
            <NextTopLoader showSpinner={false} />
            <Toaster richColors />
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
