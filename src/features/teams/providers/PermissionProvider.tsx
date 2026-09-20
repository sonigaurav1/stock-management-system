'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';

/**
 * Permission + Organization Context
 * Provides centralized access to:
 * - User permissions (from Convex auth)
 * - User role
 * - Owner status
 * - Organization ID (current/primary org)
 * - Organization data (name, settings)
 * - All user's organizations
 * - Permission checking utility
 *
 * Prevents prop drilling and provides single source of truth for auth/org data
 * Uses:
 *   - api.auth.getCurrentUserPermissions (permissions, role, owner status)
 *   - api.organizations.getUserOrganizations (org list)
 *   - api.organizations.getOrganizationSettings (org settings)
 */

interface Organization extends Doc<'organizations'> {
  role?: string; // User's role in this organization
}

interface PermissionContextType {
  // Permissions & Role
  permissions: string[];
  role: string | null;
  isOwner: boolean;

  // Organization Data
  organizationId: string | null;
  organizationName: string | null;
  organizations: Organization[];

  // Loading State
  isLoading: boolean;

  // Utility Functions
  hasPermission: (permission: string) => boolean;
  switchOrganization: (orgId: string) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: React.ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  // Fetch current user's permissions, role, and owner status
  const permissionData = useQuery(api.auth.getCurrentUserPermissions);

  // Fetch user's organizations (primary org is first)
  const userOrganizations = useQuery(api.organizations.getUserOrganizations);

  const permissions = permissionData?.permissions ?? [];
  const role = permissionData?.role ?? null;
  const isOwner = permissionData?.isOwner ?? false;

  // Get primary organization (first one in list)
  const primaryOrg =
    userOrganizations && userOrganizations.length > 0
      ? userOrganizations[0]
      : null;

  const organizationId = primaryOrg?._id ?? null;
  const organizationName = primaryOrg?.name ?? null;
  const organizations = (userOrganizations ?? []) as Organization[];

  const isLoading =
    permissionData === undefined || userOrganizations === undefined;

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const switchOrganization = (orgId: string): void => {
    // TODO: Implement organization switching
    // Store in localStorage or context
    // Update all queries to use new orgId
    console.log('Switching to organization:', orgId);
    // This would typically:
    // 1. Save orgId to localStorage
    // 2. Trigger re-fetch of org-scoped queries
    // 3. Redirect to org dashboard
  };

  const value = useMemo<PermissionContextType>(
    () => ({
      // Permissions & Role
      permissions,
      role,
      isOwner,

      // Organization Data
      organizationId,
      organizationName,
      organizations,

      // Loading State
      isLoading,

      // Utility Functions
      hasPermission,
      switchOrganization
    }),
    [
      permissions,
      role,
      isOwner,
      organizationId,
      organizationName,
      organizations,
      isLoading
    ]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook to access permission + organization context
 * Must be used within PermissionProvider
 *
 * @example
 * const {
 *   hasPermission,        // Check if user has permission
 *   role,                 // User's role in current org
 *   isOwner,              // Is user org owner?
 *   organizationId,       // Current org ID
 *   organizationName,     // Current org name
 *   organizations,        // List of all orgs user belongs to
 *   switchOrganization    // Switch to different org
 * } = usePermission()
 *
 * if (hasPermission('edit_products')) {
 *   // Show edit UI
 * }
 */
export function usePermission() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error(
      'usePermission must be used within PermissionProvider. ' +
        'Make sure PermissionProvider wraps your component in the authenticated layout.'
    );
  }
  return context;
}
