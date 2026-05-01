import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const users = [
  {
    id: '1',
    name: 'John Admin',
    email: 'john@company.com',
    role: 'admin',
    lastLogin: '2 hours ago'
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'sarah@company.com',
    role: 'manager',
    lastLogin: '1 day ago'
  },
  {
    id: '3',
    name: 'Mike Operator',
    email: 'mike@company.com',
    role: 'operator',
    lastLogin: '30 mins ago'
  },
  {
    id: '4',
    name: 'Lisa Viewer',
    email: 'lisa@company.com',
    role: 'viewer',
    lastLogin: '3 days ago'
  }
];

const rolePermissions = [
  {
    role: 'admin',
    description: 'Full system access',
    permissions: [
      'view_inventory',
      'create_transaction',
      'edit_transaction',
      'delete_transaction',
      'export_data',
      'view_reports',
      'manage_users',
      'view_audit_logs',
      'manage_settings',
      'view_compliance'
    ]
  },
  {
    role: 'manager',
    description: 'Department-level operations',
    permissions: [
      'view_inventory',
      'create_transaction',
      'edit_transaction',
      'export_data',
      'view_reports',
      'view_audit_logs'
    ]
  },
  {
    role: 'operator',
    description: 'Daily transaction processing',
    permissions: ['view_inventory', 'create_transaction', 'edit_transaction']
  },
  {
    role: 'viewer',
    description: 'Read-only access',
    permissions: ['view_inventory', 'view_reports']
  }
];

function getRoleBadge(role: string) {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    manager: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    operator:
      'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    viewer: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
  };
  return colors[role] || '';
}

export function AccessControl() {
  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Access Control Management</CardTitle>
              <CardDescription>
                Role-based access control (RBAC) & permissions
              </CardDescription>
            </div>
            <Button className='gap-2'>
              <Users className='h-4 w-4' />
              Manage Roles
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Access Summary */}
            <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-2 text-sm text-muted-foreground'>
                  Total Users
                </p>
                <p className='text-2xl font-bold'>24</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  4 roles active
                </p>
              </div>

              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-2 text-sm text-muted-foreground'>Admins</p>
                <p className='text-2xl font-bold'>3</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  100% MFA enabled
                </p>
              </div>

              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-2 text-sm text-muted-foreground'>
                  Active Sessions
                </p>
                <p className='text-2xl font-bold'>12</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Last 24 hours
                </p>
              </div>

              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-2 text-sm text-muted-foreground'>
                  Failed Attempts
                </p>
                <p className='text-2xl font-bold text-orange-600'>0</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Past 7 days
                </p>
              </div>
            </div>

            {/* Active Users */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Active Users</h3>
              <div className='space-y-2'>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className='flex items-center justify-between rounded-lg border bg-white p-4 dark:bg-slate-800'
                  >
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <p className='text-sm font-medium'>{user.name}</p>
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-4'>
                        <p className='text-xs text-muted-foreground'>
                          {user.email}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Last login: {user.lastLogin}
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm'>
                        Edit
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-red-600 hover:text-red-700'
                      >
                        Deactivate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Permissions Matrix */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Role Permission Matrix</h3>
              <div className='overflow-x-auto rounded-lg border bg-white dark:bg-slate-800'>
                <table className='w-full text-xs'>
                  <thead>
                    <tr className='border-b dark:border-slate-700'>
                      <th className='p-3 text-left font-semibold'>Role</th>
                      <th className='p-3 text-left font-semibold'>
                        Description
                      </th>
                      <th className='p-3 text-left font-semibold'>
                        Permissions
                      </th>
                      <th className='p-3 text-right font-semibold'>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolePermissions.map((rp) => (
                      <tr
                        key={rp.role}
                        className='border-b dark:border-slate-700'
                      >
                        <td className='p-3'>
                          <Badge className={getRoleBadge(rp.role)}>
                            {rp.role.toUpperCase()}
                          </Badge>
                        </td>
                        <td className='p-3'>{rp.description}</td>
                        <td className='p-3'>
                          <div className='flex flex-wrap gap-1'>
                            {rp.permissions.slice(0, 3).map((perm) => (
                              <span
                                key={perm}
                                className='rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-700'
                              >
                                {perm.split('_').join(' ')}
                              </span>
                            ))}
                            {rp.permissions.length > 3 && (
                              <span className='rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-700'>
                                +{rp.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='p-3 text-right font-semibold'>
                          {rp.permissions.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security Alerts */}
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>Security Status</h3>
              <div className='space-y-2'>
                <div className='flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900'>
                  <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600' />
                  <div>
                    <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                      All Admins Protected
                    </p>
                    <p className='text-xs text-green-800 dark:text-green-200'>
                      Multi-factor authentication enabled on 3/3 admin accounts
                    </p>
                  </div>
                </div>

                <div className='flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900'>
                  <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600' />
                  <div>
                    <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                      Segregation of Duties
                    </p>
                    <p className='text-xs text-green-800 dark:text-green-200'>
                      No users have conflicting permissions (view + delete)
                    </p>
                  </div>
                </div>

                <div className='flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
                  <div>
                    <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                      Scheduled Review
                    </p>
                    <p className='text-xs text-blue-800 dark:text-blue-200'>
                      Next quarterly access review scheduled for 2024-06-30
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Management */}
            <div className='rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-700 dark:bg-teal-900'>
              <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold text-teal-900 dark:text-teal-100'>
                <Shield className='h-4 w-4' />
                Best Practices
              </h3>
              <ul className='space-y-2 text-sm text-teal-800 dark:text-teal-200'>
                <li>• Implement principle of least privilege for all users</li>
                <li>• Review permissions quarterly or after role changes</li>
                <li>• Enforce multi-factor authentication (MFA) for admins</li>
                <li>• Monitor and log all access control changes</li>
                <li>• Remove access immediately upon user termination</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
