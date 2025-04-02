// utils/auth.ts
import { useUser } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';

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
