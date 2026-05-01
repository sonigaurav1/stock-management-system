import SignInViewPage from '@/features/auth/components/SignInView';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PATH } from '@/constants/PATH';

export default async function SignInCatchAllPage() {
  const { userId } = await auth();

  if (userId) {
    redirect(PATH.OVERVIEW);
  }

  return <SignInViewPage />;
}
