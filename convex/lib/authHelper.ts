import { QueryCtx, MutationCtx } from '../_generated/server';
import {
  Permission,
  hasPermission,
  getPresetPermissions,
  PERMISSIONS
} from './permissions';

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
    const roleRecord = await ctx.db
      .query('customRoles')
      .withIndex('by_user', (q) => q.eq('userId', membership.companyOwnerId))
      .filter((q) => q.eq(q.field('name'), membership.role))
      .first();

    return {
      callerId,
      ownerId: membership.companyOwnerId, // ← ownerId is the OWNER, not the staff member
      role: membership.role,
      permissions: roleRecord?.permissions ?? [],
      isOwner: false,
      membershipId: membership._id.toString()
    };
  }

  // They are the account owner - full access to their own data
  return {
    callerId,
    ownerId: callerId, // Owner accesses their own data
    role: 'owner',
    permissions: Object.values({
      view_inventory: 'view_inventory',
      create_product: 'create_product',
      edit_product: 'edit_product',
      delete_product: 'delete_product',
      manage_stock: 'manage_stock',
      create_transaction: 'create_transaction',
      edit_transaction: 'edit_transaction',
      delete_transaction: 'delete_transaction',
      approve_transaction: 'approve_transaction',
      view_reports: 'view_reports',
      export_data: 'export_data',
      view_ledger: 'view_ledger',
      manage_expenses: 'manage_expenses',
      view_financial_reports: 'view_financial_reports',
      manage_suppliers: 'manage_suppliers',
      manage_users: 'manage_users',
      manage_roles: 'manage_roles',
      manage_settings: 'manage_settings',
      view_organization: 'view_organization',
      manage_organization: 'manage_organization',
      view_audit_logs: 'view_audit_logs',
      view_compliance: 'view_compliance'
    }),
    isOwner: true
  };
}

/**
 * Check if user has a specific permission
 * Throws error if permission is denied
 */
export function requirePermission(
  ctx: MemberContext,
  permission: Permission | string
): void {
  if (!hasPermission(ctx.permissions, permission)) {
    throw new Error(
      `Access denied: missing permission '${permission}'. Your role '${ctx.role}' does not have this permission.`
    );
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
    throw new Error(
      `Access denied: your role '${ctx.role}' does not have any of the required permissions.`
    );
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
  requirePermission(callerCtx, 'manage_users');

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

/**
 * UNIFIED: Check both companyMembers AND teamMembers for permissions
 * This bridges the gap during migration from teamManagement to companyAccess
 * DEPRECATED teamMembers path - will be removed after full migration
 */
export async function resolveCallerContextUnified(
  ctx: QueryCtx | MutationCtx
): Promise<MemberContext> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const callerId = identity.subject;

  // Check companyMembers first (new canonical system)
  const companyMembership = await ctx.db
    .query('companyMembers')
    .withIndex('by_userId', (q) => q.eq('userId', callerId))
    .filter((q) => q.eq(q.field('status'), 'accepted'))
    .first();

  if (companyMembership) {
    const roleRecord = await ctx.db
      .query('customRoles')
      .withIndex('by_user', (q) =>
        q.eq('userId', companyMembership.companyOwnerId)
      )
      .filter((q) => q.eq(q.field('name'), companyMembership.role))
      .first();

    return {
      callerId,
      ownerId: companyMembership.companyOwnerId,
      role: companyMembership.role,
      permissions:
        roleRecord?.permissions ?? getPresetPermissions(companyMembership.role),
      isOwner: false,
      membershipId: companyMembership._id.toString()
    };
  }

  // DEPRECATED: Check teamMembers (legacy system - to be removed)
  const teamMemberships = await ctx.db
    .query('teamMembers')
    .withIndex('by_user_and_member', (q) =>
      q.eq('userId', callerId).eq('memberKey', callerId)
    )
    .collect();

  if (teamMemberships.length > 0) {
    // Aggregate permissions from all teams
    const allPerms = new Set<string>();
    for (const m of teamMemberships) {
      if (m.customRoleId) {
        const role = await ctx.db.get(m.customRoleId);
        if (role) {
          role.permissions.forEach((p: string) => allPerms.add(p));
        }
      }
    }

    // Return unified context with legacy indicator
    return {
      callerId,
      ownerId: teamMemberships[0].userId,
      role: 'team_member',
      permissions: Array.from(allPerms),
      isOwner: false,
      membershipId: teamMemberships[0]._id.toString()
    };
  }

  // Owner path (unchanged)
  return {
    callerId,
    ownerId: callerId,
    role: 'owner',
    permissions: Object.values(PERMISSIONS),
    isOwner: true
  };
}
