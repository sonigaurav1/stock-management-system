'use client';

import PageContainer from '@/components/layout/PageContainer';
import { MessageInbox } from '@/features/communication';

export default function InboxPage() {
  return (
    <PageContainer>
      <MessageInbox />
    </PageContainer>
  );
}
