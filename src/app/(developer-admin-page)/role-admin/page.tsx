// eslint-disable-next-line import/no-unresolved
import RoleGuard from '@/features/auth/components/RoleGuard';

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['Admin']}>
      <div>
        <h1>Admin Dashboard</h1>
        {/* Admin content */}
      </div>
    </RoleGuard>
  );
}
