'use client';

import { ReactNode } from 'react';
import { OnboardingStateProvider } from '@/features/auth/providers/OnboardingStateProvider';

export default function OnboardingLayout({
  children
}: {
  children: ReactNode;
}) {
  // Onboarding is in the public (auth) route group
  // Authentication check happens in the page itself
  return <OnboardingStateProvider>{children}</OnboardingStateProvider>;
}
