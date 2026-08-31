/**
 * Enterprise-Grade Permission Validation System
 * Prevents permission mismatches and ensures RBAC consistency
 */

import { PERMISSIONS } from './permissions';
import { ROLE_PRESETS } from './permissions';

/**
 * Validates that all permissions in the system are properly defined
 * This prevents the hardcoded permission bug we just fixed
 */
export function validatePermissionSystem(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check if ROLE_PRESETS owner has all permissions
  const ownerPermissions = ROLE_PRESETS.owner;
  const allPermissions = Object.values(PERMISSIONS);

  const missingPermissions = allPermissions.filter(
    (permission) => !ownerPermissions.includes(permission)
  );

  if (missingPermissions.length > 0) {
    errors.push(
      `Owner role is missing ${missingPermissions.length} permissions: ${missingPermissions.join(', ')}`
    );
  }

  // 2. Check for duplicate permissions in role presets
  for (const [roleName, permissions] of Object.entries(ROLE_PRESETS)) {
    const uniquePermissions = [...new Set(permissions)];
    if (permissions.length !== uniquePermissions.length) {
      warnings.push(
        `Role '${roleName}' has duplicate permissions (${permissions.length - uniquePermissions.length} duplicates)`
      );
    }
  }

  // 3. Check if all permissions in presets are valid
  for (const [roleName, permissions] of Object.entries(ROLE_PRESETS)) {
    const invalidPermissions = permissions.filter(
      (permission) => !allPermissions.includes(permission)
    );

    if (invalidPermissions.length > 0) {
      errors.push(
        `Role '${roleName}' has invalid permissions: ${invalidPermissions.join(', ')}`
      );
    }
  }

  // 4. Check permission naming consistency
  const permissionNames = Object.keys(PERMISSIONS);
  const inconsistentNames = permissionNames.filter((name) => {
    // Should be UPPER_SNAKE_CASE
    return !name.match(/^[A-Z][A-Z_]*[A-Z]$/);
  });

  if (inconsistentNames.length > 0) {
    warnings.push(
      `Permissions with inconsistent naming: ${inconsistentNames.join(', ')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Gets the complete permission set for a role
 * Ensures no permission is missed
 */
export function getRolePermissions(roleName: string): string[] {
  // For owner, always return ALL permissions to prevent missing permissions
  if (roleName === 'owner') {
    return Object.values(PERMISSIONS);
  }

  // For other roles, use the preset
  return ROLE_PRESETS[roleName] || [];
}

/**
 * Validates that a user has the expected permissions for their role
 * Useful for debugging permission issues
 */
export function validateUserPermissions(
  userRole: string,
  userPermissions: string[]
): {
  isValid: boolean;
  expectedPermissions: string[];
  missingPermissions: string[];
  extraPermissions: string[];
} {
  const expectedPermissions = getRolePermissions(userRole);
  const missingPermissions = expectedPermissions.filter(
    (p) => !userPermissions.includes(p)
  );
  const extraPermissions = userPermissions.filter(
    (p) => !expectedPermissions.includes(p)
  );

  return {
    isValid: missingPermissions.length === 0,
    expectedPermissions,
    missingPermissions,
    extraPermissions
  };
}

/**
 * Enterprise-grade permission check with detailed error reporting
 */
export function requirePermissionWithDetails(
  userPermissions: string[],
  requiredPermission: string,
  userRole: string
): {
  success: boolean;
  error?: string;
  details?: {
    userRole: string;
    userPermissionCount: number;
    hasPermission: boolean;
    allPermissions: string[];
  };
} {
  const hasPermission = userPermissions.includes(requiredPermission);

  if (!hasPermission) {
    return {
      success: false,
      error: `Access denied: missing permission '${requiredPermission}'. Your role '${userRole}' does not have this permission.`,
      details: {
        userRole,
        userPermissionCount: userPermissions.length,
        hasPermission: false,
        allPermissions: userPermissions
      }
    };
  }

  return {
    success: true,
    details: {
      userRole,
      userPermissionCount: userPermissions.length,
      hasPermission: true,
      allPermissions: userPermissions
    }
  };
}
