/**
 * Hook to access the current user's role and permissions
 * Integrates with Convex RBAC system
 *
 * Usage:
 * const { can, role, isOwner } = useUserRole();
 * if (can('manage_users')) { ... }
 */

'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

export type UserRole = 'owner' | 'manager' | 'staff' | 'viewer' | string;

/**
 * Main hook - get full user context with permissions
 */
export function useUserRole() {
  const context = useQuery(api.companyAccess.getCallerContext);
  const { user } = useUser();

  return {
    // User's Clerk ID (the logged-in account)
    callerId: context?.callerId ?? user?.id ?? null,

    // Organization owner's ID (whose data they're accessing)
    // For owners: same as callerId
    // For staff: owner's userId
    ownerId: context?.ownerId ?? null,

    // User's role name ("owner", "manager", "staff", "viewer", etc.)
    role: context?.role ?? null,

    // Array of permission strings
    permissions: context?.permissions ?? [],

    // Whether this is the organization owner
    isOwner: context?.isOwner ?? false,

    // Loading state
    isLoading: context === undefined,

    /**
     * Check if user has a specific permission
     * @param permission Permission string to check
     * @returns true if user has permission
     *
     * Usage: if (can('manage_users')) { ... }
     */
    can: (permission: string): boolean => {
      return context?.permissions.includes(permission) ?? false;
    },

    /**
     * Check if user has ANY of the permissions
     * @param permissions Array of permission strings
     * @returns true if user has at least one
     *
     * Usage: if (canAny(['delete_product', 'delete_transaction'])) { ... }
     */
    canAny: (permissions: string[]): boolean => {
      return permissions.some((p) => context?.permissions.includes(p)) ?? false;
    },

    /**
     * Check if user has ALL of the permissions
     * @param permissions Array of permission strings
     * @returns true if user has all
     *
     * Usage: if (canAll(['manage_users', 'manage_settings'])) { ... }
     */
    canAll: (permissions: string[]): boolean => {
      return (
        permissions.every((p) => context?.permissions.includes(p)) ?? false
      );
    },

    /**
     * Require permission or throw
     * Use for critical operations, though ideally backend handles this
     *
     * Usage: requirePermission('delete_product')
     */
    requirePermission: (permission: string): void => {
      if (!context?.permissions.includes(permission)) {
        throw new Error(
          `Permission denied: you do not have permission to '${permission}'`
        );
      }
    }
  };
}

/**
 * Check if user has a specific role
 */
export function useHasRole(requiredRole: UserRole | UserRole[]): boolean {
  const { role } = useUserRole();
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(role ?? '');
}

/**
 * Check if user is Owner or Manager (elevated permissions)
 */
export function useIsAdmin(): boolean {
  return useHasRole(['owner', 'manager']);
}

/**
 * Check if user is Owner (highest permission level)
 */
export function useIsOwnerRole(): boolean {
  return useHasRole('owner');
}

/**
 * Hook to check if user is loading
 */
export function useIsLoadingRole(): boolean {
  const context = useQuery(api.companyAccess.getCallerContext);
  return context === undefined;
}

/**
 * Hook to get only permissions
 */
export function usePermissions(): string[] {
  const context = useQuery(api.companyAccess.getCallerContext);
  return context?.permissions ?? [];
}

/**
 * Get role display label
 */
export function getRoleLabel(role: UserRole | null): string {
  const labels: Record<string, string> = {
    owner: 'Owner',
    manager: 'Manager',
    staff: 'Staff',
    viewer: 'Viewer'
  };
  return labels[role ?? 'viewer'] || 'Viewer';
}

/**
 * Get role color for UI (Tailwind classes)
 */
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    Owner:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Editor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    User: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  };
  return colors[role] || colors.User;
}

/**
 * Get role permissions level (higher number = more permissions)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    Owner: 100,
    Admin: 80,
    Editor: 50,
    User: 10
  };
  return levels[role] || 0;
}

/**
 * Check if a role has permission level >= required level
 */
export function hasPermissionLevel(
  role: UserRole,
  requiredLevel: number
): boolean {
  return getRoleLevel(role) >= requiredLevel;
}
