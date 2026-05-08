/**
 * Hook to recover from failed Clerk metadata sync
 * Checks localStorage on mount and attempts to sync any pending role data
 *
 * Usage: Add to your root layout or main app component
 * const { hasPendingSync, isRecovering, error } = usePendingRoleSync();
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface PendingRoleSync {
  userId: string;
  role: string;
  companyOwnerId: string;
  ownerUsername: string;
  companyName: string;
  timestamp: number;
}

const SYNC_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours - after this, we consider it stale

export function usePendingRoleSync() {
  const { user, isLoaded } = useUser();
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run when user is loaded
    if (!isLoaded || !user) return;

    const attemptRecovery = async () => {
      try {
        // Check for pending sync in localStorage
        const pendingJson = localStorage.getItem('pendingRoleSync');
        if (!pendingJson) return;

        const pending: PendingRoleSync = JSON.parse(pendingJson);

        // Verify this is for the current user
        if (pending.userId !== user.id) {
          console.log(
            '[usePendingRoleSync] Pending sync is for different user, clearing'
          );
          localStorage.removeItem('pendingRoleSync');
          return;
        }

        // Check if sync is stale (older than 24 hours)
        if (Date.now() - pending.timestamp > SYNC_TIMEOUT) {
          console.log(
            '[usePendingRoleSync] Pending sync is stale (>24h), clearing'
          );
          localStorage.removeItem('pendingRoleSync');
          return;
        }

        // Check if metadata is already correct
        const currentMetadata = user.publicMetadata;
        if (
          currentMetadata?.companyOwnerId === pending.companyOwnerId &&
          currentMetadata?.role === pending.role
        ) {
          console.log(
            '[usePendingRoleSync] Metadata already correct, clearing pending sync'
          );
          localStorage.removeItem('pendingRoleSync');
          return;
        }

        console.log(
          '[usePendingRoleSync] Found pending sync, attempting recovery...'
        );
        setHasPendingSync(true);
        setIsRecovering(true);

        // Attempt to sync the metadata
        const response = await fetch('/api/roles', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: pending.userId,
            role: pending.role,
            companyOwnerId: pending.companyOwnerId,
            ownerUsername: pending.ownerUsername,
            companyName: pending.companyName
          })
        });

        if (response.ok) {
          console.log('[usePendingRoleSync] Recovery successful');
          localStorage.removeItem('pendingRoleSync');
          setHasPendingSync(false);

          // Reload user to get updated metadata
          await user.reload();
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        console.error('[usePendingRoleSync] Recovery failed:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsRecovering(false);
      }
    };

    attemptRecovery();
  }, [isLoaded, user]);

  return { hasPendingSync, isRecovering, error };
}

/**
 * Manual retry function for pending sync
 * Can be used in a "Sync Status" UI component
 */
export async function retryPendingRoleSync(
  userId: string,
  role: string,
  companyOwnerId: string,
  ownerUsername: string,
  companyName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/roles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        role,
        companyOwnerId,
        ownerUsername,
        companyName
      })
    });

    if (response.ok) {
      localStorage.removeItem('pendingRoleSync');
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Clear any pending sync (useful for logout or when user declines)
 */
export function clearPendingRoleSync(): void {
  try {
    localStorage.removeItem('pendingRoleSync');
  } catch (e) {
    // Ignore localStorage errors
  }
}
