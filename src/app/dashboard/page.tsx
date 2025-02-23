'use client';

import { PATH } from '@/constants/PATH';
import { useUser } from '@clerk/clerk-react';
import { redirect } from 'next/navigation';

export default function Page() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    redirect(PATH.OVERVIEW);
  } else {
    redirect(PATH.LOGIN);
  }
}
