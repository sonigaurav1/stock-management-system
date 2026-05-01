'use client';

import { ReactNode } from 'react';

export default function OnboardingLayout({
  children
}: {
  children: ReactNode;
}) {
  // Onboarding is in the public (auth) route group
  // Authentication check happens in the page itself
  return <>{children}</>;
}
