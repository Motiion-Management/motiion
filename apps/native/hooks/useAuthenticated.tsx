import { api } from '@packages/backend/convex/_generated/api';
import { useConvexAuth, useQuery } from 'convex/react';

export function useAuthenticated() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  const user = useQuery(api.users.getMyUser);

  // If loading, return null to avoid rendering protected content
  if (isLoading || user === undefined) {
    return { isLoading: true, isAuthenticated: false };
  }

  // Return authentication status
  return { isLoading: false, isAuthenticated: isAuthenticated && user !== null };
}
