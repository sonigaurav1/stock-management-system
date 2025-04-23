'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { UserRole, useUserRole } from '../hooks/useAuthRole';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  fallbackPath?: string;
  children: ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  fallbackPath = '/dashboard/overview',
  children
}: RoleGuardProps) {
  const { role, isLoaded } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !allowedRoles.includes(role)) {
      router.push(fallbackPath);
    }
  }, [isLoaded, role, allowedRoles, fallbackPath, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
