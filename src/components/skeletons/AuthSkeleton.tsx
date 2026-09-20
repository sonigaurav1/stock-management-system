/**
 * Auth Loading Skeleton
 * Shown while checking authentication status
 * Replaces full-page spinners with dedicated auth loading UI
 */

export function AuthSkeleton() {
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center space-y-4 bg-background'>
      <div className='flex justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary' />
      </div>
      <p className='text-sm text-muted-foreground'>Loading your account...</p>
    </div>
  );
}
