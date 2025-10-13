import { api } from '@packages/backend/convex/_generated/api';
import { useConvexAuth, useQuery } from 'convex/react';
import { useContext } from 'react';
import { SharedUserContext, SharedUserContextValue } from '~/contexts/SharedUserContext';

/**
 * Hook that uses SharedUserContext if available, otherwise falls back to direct query
 * This prevents issues when used outside of SharedUserProvider
 */
export function useUser(): SharedUserContextValue {
  const context = useContext(SharedUserContext);

  // If we're inside SharedUserProvider, use the shared value
  if (context) {
    return context;
  }

  // Otherwise, make the query directly
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const shouldFetchUser = isAuthenticated && !authLoading;

  const user = useQuery(api.users.users.getMyUser, shouldFetchUser ? undefined : 'skip');

  return {
    user: user ?? null,
    isLoading: authLoading || (shouldFetchUser && user === undefined),
  };
}
