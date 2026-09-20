// utils/auth.ts
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { InvitationData, PasswordStrength } from '../interfaces/IAuth';

export function useAuthenticatedQuery(queryFunction: any, ...args: any[]) {
  const { isSignedIn } = useUser();

  // Only run the query if the user is signed in
  return useQuery(queryFunction, isSignedIn ? args[0] : undefined);
}

export function useAuthenticatedMutation(mutationFunction: any) {
  const mutation = useMutation(mutationFunction);
  const { isSignedIn } = useUser();

  return (args: any) => {
    if (!isSignedIn) {
      throw new Error('User not authenticated');
    }
    return mutation(args);
  };
}

// Helper to check if invitation has complete business data (all required fields filled)
export function hasInvitationBusinessData(
  invitation: InvitationData | null | undefined
): boolean {
  if (!invitation) return false;
  return !!(
    invitation.companyName &&
    invitation.businessType &&
    invitation.businessPhone &&
    invitation.businessAddress &&
    invitation.businessCity &&
    invitation.businessState &&
    invitation.businessCountry &&
    invitation.businessPostalCode
  );
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  return {
    hasLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password)
  };
};

export const getPasswordStrengthLevel = (
  strength: PasswordStrength
): { level: number; label: string; color: string } => {
  const checkedItems = Object.values(strength).filter(Boolean).length;

  if (checkedItems <= 2) {
    return { level: 1, label: 'Weak', color: 'bg-red-500' };
  } else if (checkedItems === 3) {
    return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
  } else if (checkedItems === 4) {
    return { level: 3, label: 'Good', color: 'bg-amber-500' };
  } else {
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  }
};

// Get user's country - dynamic detection
export function getDefaultCountry(): string {
  return 'NP'; // Default to Nepal, user can change in form
}

export function isDevelopementEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}
