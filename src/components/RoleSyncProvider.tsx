/**
 * Role Sync Provider
 * Client component that handles Clerk metadata sync recovery
 * Should be placed inside ConvexClientProvider in the root layout
 */

'use client';

import { usePendingRoleSync } from '@/hooks/usePendingRoleSync';
import { RoleSyncStatus } from '@/features/teams/components/RoleSyncStatus';

interface RoleSyncProviderProps {
  children: React.ReactNode;
}

export function RoleSyncProvider({ children }: RoleSyncProviderProps) {
  // Auto-recover any pending role sync on app load
  usePendingRoleSync();

  return (
    <>
      {/* Shows banner if there's a pending Clerk metadata sync */}
      <RoleSyncStatus />
      {children}
    </>
  );
}
