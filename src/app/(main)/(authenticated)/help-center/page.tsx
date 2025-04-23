import PageContainer from '@/components/layout/PageContainer';
import HelpCenter from '@/features/help/components/HelpCenter';
import React from 'react';

export const metadata = {
  title: 'Help Center',
  description: 'Get help and support for your account and services.'
};

const HelpCenterPage = () => {
  return (
    <PageContainer scrollable>
      <HelpCenter />
    </PageContainer>
  );
};

export default HelpCenterPage;
