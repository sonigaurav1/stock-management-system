import { QueryCtx, MutationCtx } from '../_generated/server';
import {
  Permission,
  hasPermission,
  getPresetPermissions,
  PERMISSIONS
} from './permissions';

/**
 * Normalize role name to lowercase to prevent case-sensitivity issues
 */
export function normalizeRole(role: string): string {
  return role.toLowerCase().trim();
}

/**
 * Represents the context of who is making the request and what they can access
 */
export type MemberContext = {
  callerId: string; // The logged-in user's Clerk ID
  ownerId: string; // The tenant/owner whose data to access
  role: string; // Their role name (e.g., "staff", "manager")
  permissions: string[]; // Their permissions array
  isOwner: boolean; // Is this the account owner?
  membershipId?: string; // ID of their companyMembers record (if staff)
};

/**
 * Core auth resolver: Determines who is calling and what they can access
 *
 * Key insight:
 * - Owner: callerId = ownerId (they access their own data)
 * - Staff: callerId != ownerId (they access owner's data via companyMembers link)
 *
 * This is where multi-tenant isolation happens. Staff queries automatically
 * fetch the owner's data.
 */
export async function resolveCallerContext(
  ctx: QueryCtx | MutationCtx
): Promise<MemberContext> {
  const identity = await ctx.auth.getUserIdentity();
  console.log('identity', identity);

  if (!identity) {
    throw new Error('Not authenticated');
  }

  const callerId = identity.subject;

  // Check if this user is a staff member invited to someone else's organization
  const membership = await ctx.db
    .query('companyMembers')
    .withIndex('by_userId', (q) => q.eq('userId', callerId))
    .filter((q) => q.eq(q.field('status'), 'accepted'))
    .first();

  if (membership) {
    // They are a staff member - resolve their role and permissions
    const normalizedRole = normalizeRole(membership.role);
    const roleRecord = await ctx.db
      .query('customRoles')
      .withIndex('by_user', (q) => q.eq('userId', membership.companyOwnerId))
      .filter((q) => q.eq(q.field('name'), normalizedRole))
      .first();

    // 🔴 CRITICAL FIX: Use preset permissions as fallback when custom role not found
    const permissions =
      roleRecord?.permissions ?? getPresetPermissions(normalizedRole);

    return {
      callerId,
      ownerId: membership.companyOwnerId, // ← ownerId is the OWNER, not the staff member
      role: normalizeRole(membership.role),
      permissions,
      isOwner: false,
      membershipId: membership._id.toString()
    };
  }

  // They are the account owner - full access to their own data
  return {
    callerId,
    ownerId: callerId, // Owner accesses their own data
    role: 'owner',
    permissions: Object.values(PERMISSIONS), // 🔴 CRITICAL FIX: Use all permissions from constants
    isOwner: true
  };
}

import { ConvexError } from 'convex/values';

/**
 * Check if user has a specific permission
 * Throws error if permission is denied
 */
export function requirePermission(
  ctx: MemberContext,
  permission: Permission | string
): void {
  if (!hasPermission(ctx.permissions, permission)) {
    throw new ConvexError({
      type: 'PermissionError',
      message: `Access denied: missing permission '${permission}'. Your role '${ctx.role}' does not have this permission.`
    });
  }
}

/**
 * Check if user has any of the required permissions
 * Throws error if none are found
 */
export function requireAnyPermission(
  ctx: MemberContext,
  permissions: (Permission | string)[]
): void {
  const hasAny = permissions.some((p) => hasPermission(ctx.permissions, p));
  if (!hasAny) {
    throw new ConvexError({
      type: 'PermissionError',
      message: `Access denied: your role '${ctx.role}' does not have any of the required permissions.`
    });
  }
}

/**
 * Returns the correct userId to use for queries/mutations
 * Always use this instead of callerId for data scope
 */
export function getDataScopeUserId(ctx: MemberContext): string {
  return ctx.ownerId;
}

/**
 * Get all team members of an organization (for owner only)
 */
export async function getOrganizationMembers(
  ctx: QueryCtx | MutationCtx,
  callerCtx: MemberContext
): Promise<any[]> {
  requirePermission(callerCtx, PERMISSIONS.MANAGE_USERS);

  return await ctx.db
    .query('companyMembers')
    .withIndex('by_company', (q) => q.eq('companyOwnerId', callerCtx.ownerId))
    .filter((q) => q.eq(q.field('status'), 'accepted'))
    .collect();
}

/**
 * Check if a user is authorized to access this owner's data
 * Use this in read queries to prevent cross-tenant access
 */
export function assertDataAccess(
  ctx: MemberContext,
  targetOwnerId: string
): void {
  if (ctx.ownerId !== targetOwnerId) {
    throw new Error('You do not have access to this data');
  }
}
