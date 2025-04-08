import PageContainer from '@/components/layout/PageContainer';
import HelpCenter from '@/features/help/components/HelpCenter';
import React from 'react';

export const metadata = {
  title: 'Dashboard : Help Center'
};

const HelpCenterPage = () => {
  return (
    <PageContainer scrollable>
      <HelpCenter />
    </PageContainer>
  );
};

export default HelpCenterPage;
