import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId,
  assertDataAccess
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

const DEFAULT_PERMISSIONS = {
  admin: [
    'view_inventory',
    'create_transaction',
    'edit_transaction',
    'delete_transaction',
    'export_data',
    'view_reports',
    'manage_users',
    'view_audit_logs',
    'manage_settings',
    'view_compliance',
    'approve_transaction'
  ],
  manager: [
    'view_inventory',
    'create_transaction',
    'edit_transaction',
    'export_data',
    'view_reports',
    'view_audit_logs',
    'approve_transaction'
  ],
  operator: ['view_inventory', 'create_transaction', 'edit_transaction'],
  viewer: ['view_inventory', 'view_reports']
} as const;

async function requireIdentity(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  return identity;
}

async function getRolePermissions(
  ctx: { db: any },
  tenantId: string,
  roleId: Id<'customRoles'> | undefined
): Promise<string[]> {
  if (!roleId) return [];
  const role = await ctx.db.get(roleId);
  if (!role || role.userId !== tenantId) return [];
  return role.permissions;
}

async function actorPermissions(
  ctx: { db: any },
  tenantId: string,
  actorKey: string
): Promise<{ isOwner: boolean; permissions: Set<string> }> {
  if (actorKey === tenantId) {
    return { isOwner: true, permissions: new Set(DEFAULT_PERMISSIONS.admin) };
  }
  const memberships = await ctx.db
    .query('teamMembers')
    .withIndex('by_user_and_member', (q: any) =>
      q.eq('userId', tenantId).eq('memberKey', actorKey)
    )
    .collect();

  const perms = new Set<string>();
  for (const m of memberships) {
    const p = await getRolePermissions(ctx, tenantId, m.customRoleId);
    for (const x of p) perms.add(x);
  }
  return { isOwner: false, permissions: perms };
}

export const ensureTeamDefaults = mutation({
  args: {},
  async handler(ctx) {
    const identity = await requireIdentity(ctx);
    const tenantId = identity.subject;

    const existing = await ctx.db
      .query('customRoles')
      .withIndex('by_user', (q) => q.eq('userId', tenantId))
      .first();

    if (existing) return { seeded: false };

    const now = Date.now();
    const seeds: { name: string; key: keyof typeof DEFAULT_PERMISSIONS }[] = [
      { name: 'Administrator', key: 'admin' },
      { name: 'Manager', key: 'manager' },
      { name: 'Operator', key: 'operator' },
      { name: 'Viewer', key: 'viewer' }
    ];

    for (const s of seeds) {
      await ctx.db.insert('customRoles', {
        userId: tenantId,
        name: s.name,
        description: `Built-in ${s.name} role`,
        permissions: [...DEFAULT_PERMISSIONS[s.key]],
        isSystem: true,
        createdAt: now,
        updatedAt: now
      });
    }

    return { seeded: true };
  }
});

export const listCustomRoles = query({
  args: {},
  async handler(ctx) {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query('customRoles')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();
  }
});

export const createCustomRole = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string())
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ROLES);

    // 3. Use caller context for data scope
    const dataOwner = getDataScopeUserId(caller);
    const now = Date.now();

    return await ctx.db.insert('customRoles', {
      userId: dataOwner,
      name: args.name,
      description: args.description,
      permissions: args.permissions,
      isSystem: false,
      createdAt: now,
      updatedAt: now
    });
  }
});

export const updateCustomRole = mutation({
  args: {
    roleId: v.id('customRoles'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    permissions: v.optional(v.array(v.string()))
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ROLES);

    // 3. Validate data access - role must belong to caller's org
    const dataOwner = getDataScopeUserId(caller);
    const role = await ctx.db.get(args.roleId);

    if (!role || role.userId !== dataOwner) {
      throw new Error('Role not found or access denied');
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      throw new Error('Cannot modify built-in roles');
    }

    await ctx.db.patch(args.roleId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.description !== undefined
        ? { description: args.description }
        : {}),
      ...(args.permissions !== undefined
        ? { permissions: args.permissions }
        : {}),
      updatedAt: Date.now()
    });
  }
});

export const deleteCustomRole = mutation({
  args: { roleId: v.id('customRoles') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ROLES);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const role = await ctx.db.get(args.roleId);

    if (!role || role.userId !== dataOwner) {
      throw new Error('Role not found or access denied');
    }

    if (role.isSystem) {
      throw new Error('Cannot delete built-in role');
    }

    const members = await ctx.db
      .query('teamMembers')
      .withIndex('by_user', (q) => q.eq('userId', dataOwner))
      .collect();

    for (const m of members) {
      if (m.customRoleId === args.roleId) {
        await ctx.db.patch(m._id, { customRoleId: undefined });
      }
    }

    const workflows = await ctx.db
      .query('approvalWorkflows')
      .withIndex('by_user', (q) => q.eq('userId', dataOwner))
      .collect();

    for (const w of workflows) {
      const steps = w.steps.map((s) =>
        s.requiredRoleId === args.roleId
          ? { ...s, requiredRoleId: undefined }
          : s
      );
      await ctx.db.patch(w._id, { steps, updatedAt: Date.now() });
    }

    await ctx.db.delete(args.roleId);
  }
});

export const listTeams = query({
  args: {},
  async handler(ctx) {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query('teams')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();
  }
});

export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    locationLabel: v.optional(v.string())
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);

    // 3. Use caller context for data scope
    const dataOwner = getDataScopeUserId(caller);
    const now = Date.now();

    const id = await ctx.db.insert('teams', {
      userId: dataOwner,
      name: args.name,
      description: args.description,
      locationLabel: args.locationLabel,
      createdAt: now,
      updatedAt: now
    });

    await ctx.db.insert('teamActivity', {
      userId: dataOwner,
      actorKey: caller.callerId,
      teamId: id,
      action: 'team.created',
      details: args.name,
      createdAt: now
    });

    return id;
  }
});

export const updateTeam = mutation({
  args: {
    teamId: v.id('teams'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    locationLabel: v.optional(v.string())
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const team = await ctx.db.get(args.teamId);

    if (!team || team.userId !== dataOwner) {
      throw new Error('Team not found or access denied');
    }

    await ctx.db.patch(args.teamId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.description !== undefined
        ? { description: args.description }
        : {}),
      ...(args.locationLabel !== undefined
        ? { locationLabel: args.locationLabel }
        : {}),
      updatedAt: Date.now()
    });
  }
});

export const deleteTeam = mutation({
  args: { teamId: v.id('teams') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const team = await ctx.db.get(args.teamId);

    if (!team || team.userId !== dataOwner) {
      throw new Error('Team not found or access denied');
    }

    const members = await ctx.db
      .query('teamMembers')
      .withIndex('by_team', (q) => q.eq('teamId', args.teamId))
      .collect();

    for (const m of members) {
      await ctx.db.delete(m._id);
    }

    await ctx.db.delete(args.teamId);
  }
});

export const listTeamMembers = query({
  args: { teamId: v.id('teams') },
  async handler(ctx, args) {
    const identity = await requireIdentity(ctx);
    const team = await ctx.db.get(args.teamId);
    if (!team || team.userId !== identity.subject) return [];

    const rows = await ctx.db
      .query('teamMembers')
      .withIndex('by_team', (q) => q.eq('teamId', args.teamId))
      .collect();

    const roles = await ctx.db
      .query('customRoles')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();
    const roleMap = new Map(
      roles.map((r: { _id: Id<'customRoles'>; name: string }) => [
        r._id,
        r.name
      ])
    );

    return rows.map((m: (typeof rows)[number]) => ({
      ...m,
      roleName: m.customRoleId ? (roleMap.get(m.customRoleId) ?? '—') : '—'
    }));
  }
});

export const addTeamMember = mutation({
  args: {
    teamId: v.id('teams'),
    memberKey: v.string(),
    displayName: v.string(),
    email: v.optional(v.string()),
    customRoleId: v.optional(v.id('customRoles'))
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const team = await ctx.db.get(args.teamId);

    if (!team || team.userId !== dataOwner) {
      throw new Error('Team not found or access denied');
    }

    // CRITICAL: Validate role belongs to owner's org (prevent role hijacking)
    if (args.customRoleId) {
      const role = await ctx.db.get(args.customRoleId);
      if (!role || role.userId !== dataOwner) {
        throw new Error('Invalid role or access denied');
      }
    }

    const dup = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_and_member', (q) =>
        q.eq('teamId', args.teamId).eq('memberKey', args.memberKey)
      )
      .first();

    if (dup) {
      throw new Error('Member already on this team');
    }

    const now = Date.now();
    await ctx.db.insert('teamMembers', {
      userId: dataOwner,
      teamId: args.teamId,
      memberKey: args.memberKey,
      displayName: args.displayName,
      email: args.email,
      customRoleId: args.customRoleId,
      createdAt: now
    });

    await ctx.db.insert('teamActivity', {
      userId: dataOwner,
      actorKey: caller.callerId,
      teamId: args.teamId,
      action: 'member.added',
      entityType: 'teamMember',
      entityId: args.memberKey,
      details: args.displayName,
      createdAt: now
    });
  }
});

export const updateTeamMemberRole = mutation({
  args: {
    teamMemberId: v.id('teamMembers'),
    customRoleId: v.optional(v.id('customRoles'))
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission (CRITICAL: only owners can change roles)
    requirePermission(caller, PERMISSIONS.MANAGE_ROLES);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const row = await ctx.db.get(args.teamMemberId);

    if (!row || row.userId !== dataOwner) {
      throw new Error('Member not found or access denied');
    }

    // CRITICAL: Prevent role hijacking - validate new role belongs to owner's org
    if (args.customRoleId) {
      const role = await ctx.db.get(args.customRoleId);
      if (!role || role.userId !== dataOwner) {
        throw new Error('Invalid role or access denied');
      }
    }

    await ctx.db.patch(args.teamMemberId, { customRoleId: args.customRoleId });
  }
});

export const removeTeamMember = mutation({
  args: { teamMemberId: v.id('teamMembers') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const row = await ctx.db.get(args.teamMemberId);

    if (!row || row.userId !== dataOwner) {
      throw new Error('Member not found or access denied');
    }

    await ctx.db.delete(args.teamMemberId);
  }
});

export const logTeamActivity = mutation({
  args: {
    action: v.string(),
    teamId: v.optional(v.id('teams')),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    details: v.optional(v.string())
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission (VIEW_ORGANIZATION is minimal for recording activities)
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // 3. Use caller context for data scope
    const dataOwner = getDataScopeUserId(caller);
    const now = Date.now();

    await ctx.db.insert('teamActivity', {
      userId: dataOwner,
      actorKey: caller.callerId,
      teamId: args.teamId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      details: args.details,
      createdAt: now
    });
  }
});

export const listTeamActivity = query({
  args: { limit: v.optional(v.number()), teamId: v.optional(v.id('teams')) },
  async handler(ctx, args) {
    const identity = await requireIdentity(ctx);
    const limit = Math.min(args.limit ?? 80, 200);

    const collected = await ctx.db
      .query('teamActivity')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();

    let rows = collected.sort((a, b) => b.createdAt - a.createdAt);
    if (args.teamId) {
      rows = rows.filter((r) => r.teamId === args.teamId);
    }
    return rows.slice(0, limit);
  }
});

export const getTeamPerformanceMetrics = query({
  args: { days: v.optional(v.number()) },
  async handler(ctx, args) {
    const identity = await requireIdentity(ctx);
    const days = args.days ?? 30;
    const since = Date.now() - days * 86400000;

    const activity = await ctx.db
      .query('teamActivity')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();

    const filtered = activity.filter((a) => a.createdAt >= since);
    const byActor: Record<string, number> = {};
    for (const a of filtered) {
      byActor[a.actorKey] = (byActor[a.actorKey] ?? 0) + 1;
    }

    const members = await ctx.db
      .query('teamMembers')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();

    const teams = await ctx.db
      .query('teams')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();

    const memberByTeam: Record<string, number> = {};
    for (const m of members) {
      const k = m.teamId as string;
      memberByTeam[k] = (memberByTeam[k] ?? 0) + 1;
    }

    return {
      windowDays: days,
      totalActions: filtered.length,
      actionsByActor: Object.entries(byActor)
        .map(([actorKey, count]) => ({ actorKey, count }))
        .sort((a, b) => b.count - a.count),
      teamCount: teams.length,
      memberCount: members.length,
      avgMembersPerTeam:
        teams.length === 0
          ? 0
          : Math.round((members.length / teams.length) * 10) / 10,
      membersPerTeam: teams.map((t) => ({
        teamId: t._id,
        name: t.name,
        members: memberByTeam[t._id as string] ?? 0
      }))
    };
  }
});

export const listApprovalWorkflows = query({
  args: {},
  async handler(ctx) {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query('approvalWorkflows')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();
  }
});

export const upsertApprovalWorkflow = mutation({
  args: {
    workflowId: v.optional(v.id('approvalWorkflows')),
    name: v.string(),
    description: v.optional(v.string()),
    transactionTypes: v.array(v.string()),
    steps: v.array(
      v.object({
        order: v.number(),
        label: v.string(),
        requiredRoleId: v.optional(v.id('customRoles'))
      })
    ),
    isActive: v.boolean()
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // 3. Use caller context for data scope
    const dataOwner = getDataScopeUserId(caller);
    const now = Date.now();

    if (args.workflowId) {
      const w = await ctx.db.get(args.workflowId);
      if (!w || w.userId !== dataOwner) {
        throw new Error('Workflow not found or access denied');
      }

      // Validate all role IDs belong to owner's org
      for (const step of args.steps) {
        if (step.requiredRoleId) {
          const role = await ctx.db.get(step.requiredRoleId);
          if (!role || role.userId !== dataOwner) {
            throw new Error('Invalid role in workflow steps');
          }
        }
      }

      await ctx.db.patch(args.workflowId, {
        name: args.name,
        description: args.description,
        transactionTypes: args.transactionTypes,
        steps: args.steps,
        isActive: args.isActive,
        updatedAt: now
      });
      return args.workflowId;
    }

    // Validate all role IDs belong to owner's org (for new workflows)
    for (const step of args.steps) {
      if (step.requiredRoleId) {
        const role = await ctx.db.get(step.requiredRoleId);
        if (!role || role.userId !== dataOwner) {
          throw new Error('Invalid role in workflow steps');
        }
      }
    }

    return await ctx.db.insert('approvalWorkflows', {
      userId: dataOwner,
      name: args.name,
      description: args.description,
      transactionTypes: args.transactionTypes,
      steps: args.steps,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now
    });
  }
});

export const deleteApprovalWorkflow = mutation({
  args: { workflowId: v.id('approvalWorkflows') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const w = await ctx.db.get(args.workflowId);

    if (!w || w.userId !== dataOwner) {
      throw new Error('Workflow not found or access denied');
    }

    const pending = await ctx.db
      .query('approvalRequests')
      .withIndex('by_user_status', (q) =>
        q.eq('userId', dataOwner).eq('status', 'pending')
      )
      .collect();

    for (const r of pending) {
      if (r.workflowId === args.workflowId) {
        throw new Error(
          'Resolve pending approvals before deleting this workflow'
        );
      }
    }

    await ctx.db.delete(args.workflowId);
  }
});

export const listApprovalRequests = query({
  args: { status: v.optional(v.string()) },
  async handler(ctx, args) {
    const identity = await requireIdentity(ctx);
    if (args.status) {
      return await ctx.db
        .query('approvalRequests')
        .withIndex('by_user_status', (q) =>
          q.eq('userId', identity.subject).eq('status', args.status!)
        )
        .order('desc')
        .take(100);
    }
    return await ctx.db
      .query('approvalRequests')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(100);
  }
});

export const createApprovalRequest = mutation({
  args: {
    workflowId: v.id('approvalWorkflows'),
    title: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    amount: v.optional(v.number()),
    metadata: v.optional(v.any())
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.APPROVE_TRANSACTION);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const wf = await ctx.db.get(args.workflowId);

    if (!wf || wf.userId !== dataOwner || !wf.isActive) {
      throw new Error('Invalid workflow or access denied');
    }

    const now = Date.now();
    return await ctx.db.insert('approvalRequests', {
      userId: dataOwner,
      workflowId: args.workflowId,
      title: args.title,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      amount: args.amount,
      metadata: args.metadata,
      status: 'pending',
      currentStepIndex: 0,
      requestedBy: caller.callerId,
      history: [],
      createdAt: now,
      updatedAt: now
    });
  }
});

function canApproveStep(
  sortedSteps: { order: number; requiredRoleId?: Id<'customRoles'> }[],
  stepIndex: number,
  memberships: { customRoleId?: Id<'customRoles'> }[],
  permissions: Set<string>
): boolean {
  if (!permissions.has('approve_transaction')) return false;
  const step = sortedSteps[stepIndex];
  if (!step) return false;
  if (!step.requiredRoleId) return true;
  return memberships.some((m) => m.customRoleId === step.requiredRoleId);
}

export const approveApprovalStep = mutation({
  args: {
    requestId: v.id('approvalRequests'),
    note: v.optional(v.string())
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.APPROVE_TRANSACTION);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const req = await ctx.db.get(args.requestId);

    if (!req || req.userId !== dataOwner) {
      throw new Error('Request not found or access denied');
    }

    if (req.status !== 'pending') {
      throw new Error('Request is not pending');
    }

    const wf = await ctx.db.get(req.workflowId);
    if (!wf) {
      throw new Error('Workflow missing');
    }

    const sorted = [...wf.steps].sort((a, b) => a.order - b.order);
    const stepIdx = req.currentStepIndex;
    const step = sorted[stepIdx];

    if (!step) {
      throw new Error('Invalid step');
    }

    const { isOwner, permissions } = await actorPermissions(
      ctx,
      dataOwner,
      caller.callerId
    );
    const memberships = await ctx.db
      .query('teamMembers')
      .withIndex('by_user_and_member', (q) =>
        q.eq('userId', dataOwner).eq('memberKey', caller.callerId)
      )
      .collect();

    const allowed =
      isOwner || canApproveStep(sorted, stepIdx, memberships, permissions);

    if (!allowed) {
      throw new Error('Not allowed to approve at this step');
    }

    const history = [
      ...req.history,
      {
        stepIndex: stepIdx,
        actorKey: caller.callerId,
        decision: 'approved' as const,
        note: args.note,
        decidedAt: Date.now()
      }
    ];

    const next = stepIdx + 1;
    const done = next >= sorted.length;

    await ctx.db.patch(args.requestId, {
      status: done ? 'approved' : 'pending',
      currentStepIndex: done ? stepIdx : next,
      history,
      updatedAt: Date.now()
    });

    await ctx.db.insert('teamActivity', {
      userId: dataOwner,
      actorKey: caller.callerId,
      action: done ? 'approval.completed' : 'approval.step',
      entityType: 'approvalRequest',
      entityId: args.requestId,
      details: args.note ?? (done ? 'Fully approved' : `Step ${stepIdx + 1}`),
      createdAt: Date.now()
    });
  }
});

export const rejectApprovalRequest = mutation({
  args: { requestId: v.id('approvalRequests'), note: v.optional(v.string()) },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.APPROVE_TRANSACTION);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const req = await ctx.db.get(args.requestId);

    if (!req || req.userId !== dataOwner) {
      throw new Error('Request not found or access denied');
    }

    if (req.status !== 'pending') {
      throw new Error('Request is not pending');
    }

    const wf = await ctx.db.get(req.workflowId);
    if (!wf) {
      throw new Error('Workflow missing');
    }

    const { isOwner, permissions } = await actorPermissions(
      ctx,
      dataOwner,
      caller.callerId
    );

    if (!isOwner && !permissions.has('approve_transaction')) {
      throw new Error('Not allowed to reject');
    }

    const stepIdx = req.currentStepIndex;
    const history = [
      ...req.history,
      {
        stepIndex: stepIdx,
        actorKey: caller.callerId,
        decision: 'rejected' as const,
        note: args.note,
        decidedAt: Date.now()
      }
    ];

    await ctx.db.patch(args.requestId, {
      status: 'rejected',
      history,
      updatedAt: Date.now()
    });

    await ctx.db.insert('teamActivity', {
      userId: dataOwner,
      actorKey: caller.callerId,
      action: 'approval.rejected',
      entityType: 'approvalRequest',
      entityId: args.requestId,
      details: args.note,
      createdAt: Date.now()
    });
  }
});

// Generate a unique token for invitations
function generateToken(): string {
  return (
    'inv_' +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// List pending invitations for the organization
export const listInvitations = query({
  args: {},
  async handler(ctx) {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query('invitations')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', identity.subject)
      )
      .collect();
  }
});

// Get current user's permissions
export const getUserPermissions = query({
  args: { actorKey: v.optional(v.string()) },
  async handler(ctx, args) {
    const identity = await requireIdentity(ctx);
    const actorKey = args.actorKey || identity.subject;
    const tenantId = identity.subject;

    // If actor is the owner, give full admin permissions
    if (actorKey === tenantId) {
      return { isOwner: true, permissions: new Set(DEFAULT_PERMISSIONS.admin) };
    }

    // Check team member permissions
    const result = await actorPermissions(ctx, tenantId, actorKey);
    return { isOwner: result.isOwner, permissions: result.permissions };
  }
});

// Create an invitation
export const createInvitation = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    roleId: v.optional(v.id('customRoles')),
    permissions: v.array(v.string())
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    // 3. Use caller context for data scope
    const ownerId = getDataScopeUserId(caller);

    // Check if invited user is already a team member
    const existingInvitations = await ctx.db
      .query('invitations')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .collect();

    const pending = existingInvitations.filter(
      (i) => i.organizationId === ownerId && i.status === 'pending'
    );

    if (pending.length > 0) {
      throw new Error('Invitation already sent to this email');
    }

    // CRITICAL: Validate roleId belongs to owner's org (prevent role hijacking)
    let roleName = 'Team Member';
    if (args.roleId) {
      const role = await ctx.db.get(args.roleId);
      if (!role || role.userId !== ownerId) {
        throw new Error('Invalid role or access denied');
      }
      roleName = role.name;
    }

    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    const invId = await ctx.db.insert('invitations', {
      organizationId: ownerId,
      email: args.email.toLowerCase(),
      name: args.name,
      roleId: args.roleId,
      permissions: args.permissions,
      status: 'pending',
      invitedBy: caller.callerId,
      invitedAt: Date.now(),
      acceptedAt: undefined,
      token,
      expiresAt
    });

    await ctx.db.insert('teamActivity', {
      userId: ownerId,
      actorKey: caller.callerId,
      teamId: undefined,
      action: 'invitation.sent',
      entityType: 'invitation',
      entityId: invId,
      details: `${args.name} (${args.email}) - ${roleName}`,
      createdAt: Date.now()
    });

    return { id: invId, token };
  }
});

// Get invitation details by token (for sign-up flow)
export const getInvitationByToken = query({
  args: { token: v.string() },
  async handler(ctx, args) {
    const inv = await ctx.db
      .query('invitations')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!inv) return null;
    if (inv.status !== 'pending') return null;
    if (Date.now() > inv.expiresAt) {
      // Expired — return null (client or a scheduled job can clean up)
      return null;
    }

    // Get owner/tenant company details
    const companyDetails = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', inv.organizationId).eq('isDeleted', false)
      )
      .first();

    // Also get from companies table for complete address details
    const company = await ctx.db
      .query('companies')
      .withIndex('by_user', (q) => q.eq('userId', inv.organizationId))
      .first();

    const organizations = await ctx.db
      .query('organizations')
      .withIndex('by_owner', (q) => q.eq('ownerId', inv.organizationId))
      .first();

    // Get business details from companies table (has complete data including city, state, postalCode)
    const businessAddress =
      company?.address || companyDetails?.companyAddress || '';
    const businessPhone =
      company?.phone?.[0] || companyDetails?.phone?.[0] || '';
    const businessCity = company?.city || '';
    const businessState = company?.state || '';
    const businessCountry = company?.country || 'NP';
    const businessPostalCode = company?.postalCode || '';
    const businessType = company?.businessType || 'retailer'; // Default

    return {
      ...inv,
      // Business details from server (read-only on client)
      companyName:
        company?.name ||
        companyDetails?.companyName ||
        organizations?.name ||
        'Business',
      companyGST: company?.taxNumber || companyDetails?.vatNumber || '',
      businessAddress,
      businessPhone,
      businessCity,
      businessState,
      businessCountry,
      businessPostalCode,
      businessType
    };
  }
});

// Accept an invitation (after user signs up)
export const acceptInvitation = mutation({
  args: {
    invitationId: v.id('invitations'),
    userId: v.string(), // Clerk user ID of the person who accepted
    displayName: v.optional(v.string()) // Display name for the new member
  },
  async handler(ctx, args) {
    // Note: acceptInvitation doesn't require auth check as it's called after user signup
    // Invitation token is already validated in the frontend
    const inv = await ctx.db.get(args.invitationId);

    if (!inv) {
      throw new Error('Invitation not found');
    }

    if (inv.status !== 'pending') {
      throw new Error('Invitation is not pending');
    }

    if (Date.now() > inv.expiresAt) {
      throw new Error('Invitation expired');
    }

    // Get user's profile to get display name
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    const displayName =
      args.displayName ||
      userProfile?.firstName + ' ' + (userProfile?.lastName || '') ||
      args.userId;

    // Find or create the owner's team
    const existingTeam = await ctx.db
      .query('teams')
      .withIndex('by_user', (q) => q.eq('userId', inv.organizationId))
      .first();

    let ownerTeamId: Id<'teams'>;

    if (!existingTeam) {
      // Create a default team for the organization
      const now = Date.now();
      const ownerCompany = await ctx.db
        .query('companies')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', inv.organizationId).eq('isDeleted', false)
        )
        .first();

      ownerTeamId = await ctx.db.insert('teams', {
        userId: inv.organizationId,
        name: ownerCompany?.name || 'My Team',
        description: 'Default team for your organization',
        locationLabel: undefined,
        createdAt: now,
        updatedAt: now
      });

      // Log team creation
      await ctx.db.insert('teamActivity', {
        userId: inv.organizationId,
        actorKey: inv.organizationId,
        teamId: ownerTeamId,
        action: 'team.created',
        details: 'Default team created for organization',
        createdAt: now
      });
    } else {
      ownerTeamId = existingTeam._id;
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_and_member', (q) =>
        q.eq('teamId', ownerTeamId).eq('memberKey', args.userId)
      )
      .first();

    if (!existingMember) {
      // Check if there's a default "Team Member" role or create one
      let teamMemberRoleId: any = undefined;

      // Look for existing Team Member role for this organization
      const existingRoles = await ctx.db
        .query('customRoles')
        .withIndex('by_user', (q: any) => q.eq('userId', inv.organizationId))
        .collect();

      const teamMemberRole = existingRoles.find(
        (r: any) => r.name?.toLowerCase() === 'team member' && r.isSystem
      );

      if (teamMemberRole) {
        teamMemberRoleId = teamMemberRole._id;
      } else {
        // Create a default "Team Member" role with basic permissions
        const now = Date.now();
        const defaultRole = await ctx.db.insert('customRoles', {
          userId: inv.organizationId,
          name: 'Team Member',
          description: 'Default role for team members',
          permissions: [
            'view_dashboard',
            'view_products',
            'view_sales',
            'view_customers',
            'view_suppliers',
            'create_sales',
            'view_inventory'
          ],
          isSystem: true,
          createdAt: now,
          updatedAt: now
        });
        teamMemberRoleId = defaultRole;
      }

      // Add user to the team with default role
      await ctx.db.insert('teamMembers', {
        userId: inv.organizationId, // Team belongs to organization owner
        teamId: ownerTeamId,
        memberKey: args.userId,
        displayName: displayName,
        email: inv.email,
        customRoleId: teamMemberRoleId,
        createdAt: Date.now()
      });
    }

    // Mark invitation as accepted
    await ctx.db.patch(args.invitationId, {
      status: 'accepted',
      acceptedAt: Date.now()
    });

    // Log activity
    await ctx.db.insert('teamActivity', {
      userId: inv.organizationId,
      actorKey: args.userId,
      teamId: ownerTeamId,
      action: 'invitation.accepted',
      entityType: 'invitation',
      entityId: args.invitationId,
      details: inv.email,
      createdAt: Date.now()
    });
  }
});

// Delete/cancel an invitation
export const deleteInvitation = mutation({
  args: { invitationId: v.id('invitations') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const inv = await ctx.db.get(args.invitationId);

    if (!inv) {
      throw new Error('Invitation not found');
    }

    if (inv.organizationId !== dataOwner) {
      throw new Error('Not authorized to delete this invitation');
    }

    await ctx.db.delete(args.invitationId);
  }
});
