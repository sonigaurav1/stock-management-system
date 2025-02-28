/* eslint-disable no-console */
'use client';

import { useSearchParams } from 'next/navigation';
import { useSignIn } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PATH } from '@/constants/PATH';

export default function GithubSignInButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? PATH.OVERVIEW;
  const { signIn } = useSignIn();

  const handleGithubSignIn = async () => {
    try {
      if (signIn) {
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_github',
          redirectUrl: callbackUrl,
          redirectUrlComplete: callbackUrl
        });
      } else {
        console.error('signIn is undefined');
      }
    } catch (error) {
      console.error('GitHub sign-in failed:', error);
    }
  };

  return (
    <Button
      className='w-full'
      variant='outline'
      type='button'
      onClick={handleGithubSignIn}
    >
      <Icons.gitHub className='mr-2 h-4 w-4' />
      Continue with Github
    </Button>
  );
}
