'use client';

import { PATH } from '@/constants/PATH';
import { AuthSkeleton } from '@/components/skeletons/AuthSkeleton';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import MobileNavigation from '@/components/MobileNavigation';
import { AccountStatusGuard } from '@/components/auth/AccountStatusGuard';
import { BusinessProfileGuard } from '@/features/auth/components/BusinessProfileGuard';
import { RoleSyncProvider } from '@/components/RoleSyncProvider';
import { PermissionProvider } from '@/features/teams/providers/PermissionProvider';
import { FeatureFlagsProvider } from '@/features/feature-flags/providers/FeatureFlagsProvider';
import { RouteGuard } from '@/components/auth/RouteGuard';

/**
 * Authenticated Layout
 *
 * Guard Hierarchy (top-to-bottom, fail-fast approach):
 * 1. Check if auth is loaded (show AuthSkeleton if not)
 * 2. Check if user is signed in (hook redirects if not)
 * 3. Wrap children with context providers
 * 4. Apply business logic guards
 * 5. Render children
 *
 * This prevents mid-render "access denied" messages
 */
export default function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Step 1: Check auth status first
  const { isSignedIn, isLoaded } = useAuthRedirect(PATH.SIGNIN);

  // Step 2: Guard loading state (fail-fast, show skeleton)
  if (!isLoaded) {
    return <AuthSkeleton />;
  }

  // Step 3: Guard sign-in state (hook handles redirect)
  if (!isSignedIn) {
    return null;
  }

  // Step 4: Render with providers (only after guards pass)
  return (
    <RoleSyncProvider>
      <PermissionProvider>
        <FeatureFlagsProvider>
          <AccountStatusGuard>
            <BusinessProfileGuard>
              <RouteGuard>
                {children}
                <MobileNavigation />
              </RouteGuard>
            </BusinessProfileGuard>
          </AccountStatusGuard>
        </FeatureFlagsProvider>
      </PermissionProvider>
    </RoleSyncProvider>
  );
}
