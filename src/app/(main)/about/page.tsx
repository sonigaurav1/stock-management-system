import PageContainer from '@/components/layout/PageContainer';
import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'Dashboard : About this project'
};

const AboutPage = () => {
  return (
    <PageContainer scrollable>
      <div className='space-y-4'>
        <h1>About this project</h1>
        <p>
          This project was created by{' '}
          <Link href='#' className='text-muted-foreground'>
            Gaurav Soni
          </Link>{' '}
        </p>
      </div>
    </PageContainer>
  );
};

export default AboutPage;
