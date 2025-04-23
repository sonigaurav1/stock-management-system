'use client';

import { useUser } from '@clerk/clerk-react';

export type UserRole = 'Admin' | 'Editor' | 'User';

export function useUserRole() {
  const { user, isLoaded } = useUser();

  const role = (user?.publicMetadata?.role as UserRole) || 'User';

  const isAdmin = role === 'Admin';
  const isEditor = role === 'Editor';
  const isUser = role === 'User';

  return {
    role,
    isAdmin,
    isEditor,
    isUser,
    isLoaded
  };
}
