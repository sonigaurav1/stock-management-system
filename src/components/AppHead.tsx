import Script from 'next/script';

const AppHead = () => (
  <>
    {/* About Page Structured Data */}
    <Script
      id='about-page-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Penowa',
          description:
            "Learn about Penowa, India's premium healthy peanut butter and nuts butter brand. Discover our story, mission, and commitment to quality, health, and taste.",
          url:
            (process.env.NEXT_PUBLIC_SITE_URL || 'https://penowa.in') +
            '/about',
          publisher: {
            '@type': 'Organization',
            name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Penowa'
          }
        })
      }}
    />
  </>
);

export default AppHead;
