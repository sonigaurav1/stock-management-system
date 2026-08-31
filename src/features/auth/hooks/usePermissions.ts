import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

/**
 * Hook to get current user's permissions
 */
export function usePermissions() {
  const result = useQuery(api.auth.getCurrentUserPermissions);

  return {
    permissions: result?.permissions ?? [],
    role: result?.role ?? null,
    isLoading: result === undefined,
    can: (permission: string) =>
      result?.permissions?.includes(permission) ?? false
  };
}

/**
 * Hook to check if user has specific permission
 */
export function useCan(permission: string) {
  const { can } = usePermissions();
  return can(permission);
}
