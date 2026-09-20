'use client';

import { useState, useCallback } from 'react';

/**
 * Hook for managing granular loading states
 *
 * Replaces: useState(isLoading) for each async operation
 *
 * Usage:
 * const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState();
 *
 * // Option 1: Manual control
 * const handleCreate = async () => {
 *   startLoading('create');
 *   try {
 *     await createItem();
 *   } finally {
 *     stopLoading('create');
 *   }
 * };
 *
 * // Option 2: Automatic (recommended)
 * const handleCreate = withLoading('create', async () => {
 *   await createItem();
 * });
 */
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const startLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback(
    (key?: string) => {
      if (!key) {
        // Return true if ANY operation is loading
        return Object.values(loadingStates).some((state) => state);
      }
      return loadingStates[key] ?? false;
    },
    [loadingStates]
  );

  /**
   * Wrap async function to auto-manage loading state
   *
   * Usage:
   * const handleCreate = withLoading('create', async () => {
   *   await createItem();
   * });
   */
  const withLoading = useCallback(
    (key: string, fn: () => Promise<void>) => {
      return async () => {
        startLoading(key);
        try {
          await fn();
        } finally {
          stopLoading(key);
        }
      };
    },
    [startLoading, stopLoading]
  );

  /**
   * Get all loading states (for debugging)
   */
  const getAll = useCallback(() => loadingStates, [loadingStates]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
    getAll
  };
}
