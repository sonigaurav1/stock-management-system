import Head from 'next/head';

const AppHead = () => (
  <Head>
    <title>About Penowa | Premium Healthy Peanut Butter Brand India</title>
    <meta
      name='description'
      content="Learn about Penowa, India's premium healthy peanut butter and nuts butter brand. Discover our story, mission, and commitment to quality, health, and taste."
    />
    <meta
      name='keywords'
      content='about penowa, peanut butter brand, healthy peanut butter, premium nuts butter, organic peanut butter, penowa story, penowa mission'
    />
    <link
      rel='canonical'
      href={
        (process.env.NEXT_PUBLIC_SITE_URL || 'https://penowa.in') + '/about'
      }
    />
    {/* About Page Structured Data */}
    <script
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
  </Head>
);

export default AppHead;
