/**
 * Sidebar Navigation Hook
 * Provides role-based navigation filtering and utilities
 *
 * Usage:
 * const { filteredItems, quickActions, roleInfo } = useSidebarNav(navItems);
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { NavItem } from '@/types';
import {
  filterNavByRole,
  getQuickActions,
  getRoleDisplayInfo,
  canAccessSection,
  ROLE_HIERARCHY,
  MENU_PERMISSIONS,
  ROLE_NAV_CONFIG
} from '@/config/role-nav-config';

/**
 * Hook to get filtered navigation items based on user role
 */
export function useSidebarNav(items: NavItem[]) {
  const context = useQuery(api.companyAccess.getCallerContext);
  const { user } = useUser();

  const result = useMemo(() => {
    // Get user role from context
    const role = context?.role ?? null;
    const permissions = context?.permissions ?? [];
    const isOwner = context?.isOwner ?? false;

    // Create permission check function
    const can = (permission: string): boolean => {
      return permissions.includes(permission);
    };

    // Get filtered navigation items
    const filteredItems = filterNavByRole(items, role, can);

    // Get quick actions for dropdown
    const quickActions = getQuickActions(role, can);

    // Get role display info
    const roleInfo = getRoleDisplayInfo(role);

    // Get role hierarchy level
    const roleLevel = ROLE_HIERARCHY[role?.toLowerCase() ?? 'viewer'] ?? 0;

    // Check if user can access specific sections
    const canAccess = (sectionTitle: string): boolean => {
      return canAccessSection(sectionTitle, role, can);
    };

    // Get permission requirements for a section
    const getSectionPermission = (sectionTitle: string): string | undefined => {
      return MENU_PERMISSIONS[sectionTitle]?.main;
    };

    return {
      // Filtered navigation items
      filteredItems,

      // Quick actions for user dropdown
      quickActions,

      // Role display information
      roleInfo,

      // User context
      role,
      permissions,
      isOwner,
      roleLevel,

      // Helper functions
      can,
      canAccess,
      getSectionPermission,

      // Loading state
      isLoading: context === undefined
    };
  }, [context, items]);

  return result;
}

/**
 * Hook to check if user can access a specific menu item
 */
export function useCanAccessMenuItem(
  menuTitle: string,
  subItemTitle?: string
): boolean {
  const context = useQuery(api.companyAccess.getCallerContext);

  if (!context) return false;

  const permissions = context.permissions ?? [];
  const can = (permission: string): boolean => permissions.includes(permission);

  const permConfig = MENU_PERMISSIONS[menuTitle];
  if (!permConfig) return true;

  // Check main permission
  if (subItemTitle && permConfig.subItems?.[subItemTitle]) {
    return can(permConfig.subItems[subItemTitle]);
  }

  return can(permConfig.main ?? '');
}

/**
 * Hook to get user's role level
 */
export function useUserRoleLevel(): number {
  const context = useQuery(api.companyAccess.getCallerContext);
  const role = context?.role ?? 'viewer';

  return ROLE_HIERARCHY[role?.toLowerCase() ?? 'viewer'] ?? 0;
}

/**
 * Hook to check if user meets minimum role requirement
 */
export function useHasMinimumRole(requiredRole: string): boolean {
  const context = useQuery(api.companyAccess.getCallerContext);
  const userRole = context?.role ?? 'viewer';

  const userLevel = ROLE_HIERARCHY[userRole?.toLowerCase() ?? 'viewer'] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole.toLowerCase()] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Hook to get all available sections for the user
 */
export function useAvailableSections(): string[] {
  const context = useQuery(api.companyAccess.getCallerContext);
  const role = context?.role ?? null;

  const normalizedRole = role?.toLowerCase() || 'viewer';
  const config = ROLE_NAV_CONFIG[normalizedRole];

  return config?.visibleSections ?? [];
}

/**
 * Hook to get restricted sections for the user
 */
export function useRestrictedSections(): string[] {
  const context = useQuery(api.companyAccess.getCallerContext);
  const role = context?.role ?? null;

  const normalizedRole = role?.toLowerCase() || 'viewer';
  const config = ROLE_NAV_CONFIG[normalizedRole];

  return config?.restrictedSections ?? [];
}

/**
 * Type exports for the hook
 */
export type SidebarNavResult = ReturnType<typeof useSidebarNav>;
