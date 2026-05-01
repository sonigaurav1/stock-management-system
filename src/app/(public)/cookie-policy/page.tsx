import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageContainer from '@/components/layout/PageContainer';

export const metadata = {
  title: 'Cookie Policy | Digital Dukan',
  description:
    'Our cookie policy and how we use cookies to improve your experience.'
};

export default function CookiePolicyPage() {
  return (
    <PageContainer>
      <div className='space-y-8 py-8'>
        {/* Header */}
        <div className='space-y-3'>
          <h1 className='text-4xl font-bold tracking-tight'>Cookie Policy</h1>
          <p className='text-lg text-muted-foreground'>
            Know how we use cookies and your privacy preferences
          </p>
        </div>

        <div className='space-y-6'>
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>What are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-muted-foreground'>
              <p>
                Cookies are small text files that are stored on your device
                (computer, tablet, or mobile phone) when you visit our website.
                They are widely used to make websites work more efficiently and
                to provide information to the owners of the website.
              </p>
              <p>
                You can find more information about cookies at{' '}
                <a
                  href='https://www.allaboutcookies.org'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-primary hover:underline'
                >
                  www.allaboutcookies.org
                </a>
                .
              </p>
            </CardContent>
          </Card>

          {/* Essential Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Essential Cookies</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-muted-foreground'>
              <p>
                These cookies are necessary for the website to function
                properly. They include:
              </p>
              <ul className='list-inside list-disc space-y-2 pl-4'>
                <li>Authentication and security (login sessions)</li>
                <li>User preferences (language, theme settings)</li>
                <li>CSRF token for security</li>
              </ul>
              <p className='rounded-lg bg-green-50 p-4 text-sm dark:bg-green-950'>
                ✓ Essential cookies cannot be disabled and are always enabled.
              </p>
            </CardContent>
          </Card>

          {/* Analytics Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Cookies</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-muted-foreground'>
              <p>
                We use analytics cookies to understand how you use our website
                and to improve user experience. These include:
              </p>
              <ul className='list-inside list-disc space-y-2 pl-4'>
                <li>
                  Google Analytics - tracks user behavior and website
                  performance
                </li>
                <li>Page views and click tracking</li>
                <li>User journey and session duration</li>
              </ul>
              <p className='text-sm'>
                Data collected is anonymized and aggregated. You can opt out of
                analytics cookies.
              </p>
            </CardContent>
          </Card>

          {/* Marketing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Cookies</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-muted-foreground'>
              <p>
                Marketing cookies help us deliver targeted content and
                advertisements that match your interests. These include:
              </p>
              <ul className='list-inside list-disc space-y-2 pl-4'>
                <li>Facebook Pixel - for retargeting and audience insights</li>
                <li>LinkedIn Tags - for professional targeting</li>
                <li>Conversion tracking</li>
                <li>Audience segmentation</li>
              </ul>
              <p className='text-sm'>
                You can disable marketing cookies if you prefer not to see
                targeted ads.
              </p>
            </CardContent>
          </Card>

          {/* Functionality Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Functionality Cookies</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-muted-foreground'>
              <p>
                These cookies enable enhanced functionality and personalization.
                These include:
              </p>
              <ul className='list-inside list-disc space-y-2 pl-4'>
                <li>Hotjar - for session recording and heatmaps</li>
                <li>User interaction analytics</li>
                <li>Feature usage tracking</li>
                <li>Bug reporting and monitoring</li>
              </ul>
              <p className='text-sm'>
                These help us understand how features are used and identify
                issues.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-muted-foreground'>
              <p>
                We use cookies from third-party services to enhance our website.
                These include:
              </p>
              <ul className='list-inside list-disc space-y-2 pl-4'>
                <li>Google Analytics (Analytics)</li>
                <li>Facebook (Marketing)</li>
                <li>LinkedIn (Marketing)</li>
                <li>Hotjar (Functionality)</li>
              </ul>
              <p className='text-sm'>
                Each third-party service has its own privacy policy. We
                encourage you to review them.
              </p>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Managing Your Cookies</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-muted-foreground'>
              <p>You can manage your cookie preferences in several ways:</p>
              <div className='space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-950'>
                <h4 className='font-semibold text-foreground'>
                  1. Using Our Cookie Preference Center
                </h4>
                <p className='text-sm'>
                  You can change your preferences at any time by clicking on the
                  cookie banner at the bottom of our website.
                </p>
              </div>
              <div className='space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-950'>
                <h4 className='font-semibold text-foreground'>
                  2. Browser Settings
                </h4>
                <p className='text-sm'>
                  Most browsers allow you to refuse cookies or alert you when
                  cookies are being sent. However, blocking cookies may affect
                  website functionality.
                </p>
              </div>
              <div className='space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-950'>
                <h4 className='font-semibold text-foreground'>
                  3. Opt-Out Services
                </h4>
                <p className='text-sm'>
                  You can opt out of Google Analytics at{' '}
                  <a
                    href='https://tools.google.com/dlpage/gaoptout'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium text-primary hover:underline'
                  >
                    Google Analytics Opt-Out
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Questions?</CardTitle>
            </CardHeader>
            <CardContent className='text-muted-foreground'>
              <p>
                If you have any questions about our cookie policy or how we use
                cookies, please contact us at{' '}
                <a
                  href='mailto:privacy@digitaldukan.com'
                  className='font-medium text-primary hover:underline'
                >
                  privacy@digitaldukan.com
                </a>
                .
              </p>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className='text-center text-sm text-muted-foreground'>
            <p>Last updated: April 18, 2026</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
