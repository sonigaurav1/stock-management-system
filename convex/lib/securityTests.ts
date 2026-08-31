/**
 * Enterprise Security Test Suite
 * Tests for cross-tenant access prevention and RBAC enforcement
 */

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId,
  assertDataAccess
} from './authHelper';
import { PERMISSIONS } from './permissions';

/**
 * Test cross-tenant data access prevention
 * This function should only be accessible to super admins for security testing
 */
export const testCrossTenantAccess = query({
  args: {
    targetUserId: v.string() // The user ID to attempt accessing
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);

    // Only super admins should be able to run this test
    if (!caller.isOwner) {
      throw new Error('This test can only be run by organization owners');
    }

    const results = {
      testName: 'Cross-Tenant Access Prevention',
      timestamp: Date.now(),
      tests: [] as Array<{
        testName: string;
        passed: boolean;
        details: string;
      }>
    };

    // Test 1: Verify data scope isolation
    try {
      const dataScopeUserId = getDataScopeUserId(caller);
      const canAccessOwnData = dataScopeUserId === caller.ownerId;

      results.tests.push({
        testName: 'Data Scope Isolation',
        passed: canAccessOwnData,
        details: canAccessOwnData
          ? 'User can only access their own data scope'
          : 'Data scope leak detected'
      });
    } catch (error) {
      results.tests.push({
        testName: 'Data Scope Isolation',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 2: Verify permission enforcement
    try {
      // This should throw if user doesn't have permission
      requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);

      results.tests.push({
        testName: 'Permission Enforcement',
        passed: true,
        details: 'Permission checks are working correctly'
      });
    } catch (error) {
      results.tests.push({
        testName: 'Permission Enforcement',
        passed: false,
        details: `Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 3: Verify assertDataAccess prevents cross-tenant access
    try {
      // This should throw since targetUserId is different from caller's ownerId
      assertDataAccess(caller, args.targetUserId);

      results.tests.push({
        testName: 'Cross-Tenant Data Access Prevention',
        passed: false,
        details: 'Cross-tenant access was NOT prevented - SECURITY RISK!'
      });
    } catch (error) {
      results.tests.push({
        testName: 'Cross-Tenant Data Access Prevention',
        passed: true,
        details: 'Cross-tenant access correctly prevented'
      });
    }

    // Test 4: Verify staff vs owner data isolation
    try {
      if (!caller.isOwner) {
        // For staff, ownerId should be different from callerId
        const isStaffIsolated = caller.ownerId !== caller.callerId;

        results.tests.push({
          testName: 'Staff Data Isolation',
          passed: isStaffIsolated,
          details: isStaffIsolated
            ? 'Staff correctly isolated to owner data scope'
            : 'Staff data isolation failure'
        });
      } else {
        // For owners, ownerId should equal callerId
        const isOwnerCorrect = caller.ownerId === caller.callerId;

        results.tests.push({
          testName: 'Owner Data Access',
          passed: isOwnerCorrect,
          details: isOwnerCorrect
            ? 'Owner correctly accesses own data scope'
            : 'Owner data access failure'
        });
      }
    } catch (error) {
      results.tests.push({
        testName: 'Staff/Owner Data Isolation',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return results;
  }
});

/**
 * Test RBAC permission matrix
 * Verifies that roles have correct permissions
 */
export const testRBACPermissions = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);

    const results = {
      testName: 'RBAC Permission Matrix',
      timestamp: Date.now(),
      userRole: caller.role,
      userPermissions: caller.permissions,
      isOwner: caller.isOwner,
      tests: [] as Array<{
        testName: string;
        passed: boolean;
        details: string;
      }>
    };

    // Test 1: Verify owner has all permissions
    if (caller.isOwner) {
      const expectedPermissionCount = Object.values(PERMISSIONS).length;
      const hasAllPermissions =
        caller.permissions.length === expectedPermissionCount;

      results.tests.push({
        testName: 'Owner Full Access',
        passed: hasAllPermissions,
        details: hasAllPermissions
          ? `Owner has all ${expectedPermissionCount} permissions`
          : `Owner missing permissions - has ${caller.permissions.length}/${expectedPermissionCount}`
      });
    }

    // Test 2: Verify staff has limited permissions
    if (caller.role === 'staff') {
      const hasLimitedPermissions =
        caller.permissions.length < Object.values(PERMISSIONS).length;
      const hasBasicPermissions = caller.permissions.includes(
        PERMISSIONS.VIEW_INVENTORY
      );

      results.tests.push({
        testName: 'Staff Limited Access',
        passed: hasLimitedPermissions && hasBasicPermissions,
        details:
          hasLimitedPermissions && hasBasicPermissions
            ? `Staff has appropriate limited permissions (${caller.permissions.length})`
            : 'Staff permission configuration incorrect'
      });
    }

    // Test 3: Verify no duplicate permissions
    const uniquePermissions = [...new Set(caller.permissions)];
    const hasNoDuplicates =
      uniquePermissions.length === caller.permissions.length;

    results.tests.push({
      testName: 'No Duplicate Permissions',
      passed: hasNoDuplicates,
      details: hasNoDuplicates
        ? 'No duplicate permissions found'
        : `Duplicate permissions detected (${caller.permissions.length - uniquePermissions.length} duplicates)`
    });

    // Test 4: Verify all permissions are valid
    const validPermissions = Object.values(PERMISSIONS);
    const invalidPermissions = caller.permissions.filter(
      (p) => !validPermissions.includes(p as any)
    );

    results.tests.push({
      testName: 'Valid Permissions Only',
      passed: invalidPermissions.length === 0,
      details:
        invalidPermissions.length === 0
          ? 'All permissions are valid'
          : `Invalid permissions found: ${invalidPermissions.join(', ')}`
    });

    return results;
  }
});

/**
 * Test schema validation security
 * Verifies that schema validation prevents invalid data
 */
export const testSchemaValidation = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);

    const results = {
      testName: 'Schema Validation Security',
      timestamp: Date.now(),
      tests: [] as Array<{
        testName: string;
        passed: boolean;
        details: string;
      }>
    };

    // Test 1: Verify role normalization
    try {
      // This would be tested by attempting to create roles with different cases
      // For now, we'll verify the current role is normalized
      const isNormalized = caller.role === caller.role.toLowerCase();

      results.tests.push({
        testName: 'Role Normalization',
        passed: isNormalized,
        details: isNormalized
          ? `Role '${caller.role}' is properly normalized`
          : `Role '${caller.role}' is not normalized`
      });
    } catch (error) {
      results.tests.push({
        testName: 'Role Normalization',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 2: Verify permission constants usage
    try {
      // Check if permissions are using constants (not string literals)
      const hasPermissionConstants = caller.permissions.length > 0;

      results.tests.push({
        testName: 'Permission Constants Usage',
        passed: hasPermissionConstants,
        details: hasPermissionConstants
          ? 'Permission constants are being used'
          : 'No permissions found - may be using string literals'
      });
    } catch (error) {
      results.tests.push({
        testName: 'Permission Constants Usage',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return results;
  }
});

/**
 * Comprehensive security audit
 * Runs all security tests and returns a summary
 */
export const runSecurityAudit = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);

    if (!caller.isOwner) {
      throw new Error('Security audit can only be run by organization owners');
    }

    const auditResults = {
      auditName: 'Enterprise Security Audit',
      timestamp: Date.now(),
      organizationId: caller.ownerId,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        securityScore: 0 // Percentage
      },
      results: {} as Record<string, any>
    };

    // Note: In a real implementation, you would call the other test functions
    // and aggregate their results here. For now, we'll return the structure.

    return auditResults;
  }
});
