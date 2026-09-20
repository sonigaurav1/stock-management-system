import type { Metadata, Viewport } from 'next';
import AppHead from '@/components/AppHead';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { ConvexClientProvider } from '@/features/auth/providers/ConvexProvider';
import { EdgeStoreProvider } from '@/lib/edgestore';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/sonner';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { CookieConsentBanner } from '@/components/cookies/CookieConsentBanner';
import { RootErrorBoundary } from '@/components/errors/RootErrorBoundary';

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

// Metadata for SEO and social sharing
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_API_URL || 'https://digitaldukan.vercel.app'
  ),
  title: 'Digital Dukan',
  description:
    'Effortlessly manage your business inventory with our intuitive and powerful tools.',
  keywords: [
    'stock management',
    'inventory management',
    'inventory control',
    'business tools',
    'stock tracking',
    'inventory management system'
  ],
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png' },
      {
        url: '/favicon/apple-touch-icon-152x152.png',
        sizes: '152x152',
        type: 'image/png'
      },
      {
        url: '/favicon/apple-touch-icon-180x180.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon/safari-pinned-tab.svg',
        color: '#000000'
      },
      // Add manifest when ready
      { rel: 'manifest', url: '/manifest.json' }
    ]
  },
  authors: [{ name: 'Gaurav Soni' }],
  creator: 'Gaurav Soni',
  publisher: 'Gaurav Soni',
  applicationName: 'Digital Dukan',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_API_URL || 'https://digitaldukan.vercel.app',
    title: 'Digital Dukan',
    description:
      'Effortlessly manage your business inventory with our intuitive and powerful tools.',
    siteName: 'Digital Dukan',
    images: [
      {
        url: 'public/assets/images/favicon.webp',
        width: 1200,
        height: 630,
        alt: 'Digital Dukan'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sonigaurav_',
    creator: '@sonigaurav_',
    title: 'Digital Dukan',
    description:
      'Effortlessly manage your business inventory with our intuitive and powerful tools.',
    images: ['/public/assets/images/favicon.webp']
  },
  appleWebApp: {
    title: 'Digital Dukan',
    statusBarStyle: 'black-translucent',
    capable: true
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true
  },
  appLinks: {
    web: {
      url: process.env.NEXT_PUBLIC_API_URL || 'https://digitaldukan.vercel.app',
      should_fallback: true
    }
  },
  archives: [
    process.env.NEXT_PUBLIC_API_URL || 'https://digitaldukan.vercel.app',
    'archives'
  ],
  assets: [
    process.env.NEXT_PUBLIC_API_URL || 'https://digitaldukan.vercel.app',
    'assets'
  ],
  bookmarks: [
    process.env.NEXT_PUBLIC_API_URL || 'https://digitaldukan.vercel.app',
    'bookmarks'
  ],
  category: 'Business',
  classification: 'Inventory Management',
  other: {
    'business:contact_data:street_address': 'Ramdhuni - 01',
    'business:contact_data:locality': 'Itahari',
    'business:contact_data:region': 'Sunsari',
    'business:contact_data:postal_code': '56709',
    'business:contact_data:country_name': 'Nepal',
    'fb:app_id': 'YOUR_FACEBOOK_APP_ID',
    'article:published_time': '2025-04-01T00:00:00Z',
    'article:modified_time': '2025-04-01T00:00:00Z',
    'article:author': 'Gaurav Soni',
    'article:section': 'Business',
    'article:tag': 'inventory management'
  }
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
      <head>
        <meta
          name='google-site-verification'
          content='LJ6M-Ic3gnXPFzAS56WJyrcC3V7SgYtJiZUtVF2h3Wo'
        />
        <AppHead />
      </head>
      <body className='bg-background text-foreground antialiased'>
        <RootErrorBoundary>
          <ConvexClientProvider>
            <EdgeStoreProvider>
              <ThemeProvider
                attribute='class'
                defaultTheme='light'
                enableSystem
              >
                <SpeedInsights />
                <Analytics />
                <NextTopLoader showSpinner={false} />
                <Toaster richColors />
                <CookieConsentBanner />
                {children}
              </ThemeProvider>
            </EdgeStoreProvider>
          </ConvexClientProvider>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
