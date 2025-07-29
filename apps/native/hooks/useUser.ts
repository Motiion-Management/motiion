import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
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
  const user = useQuery(api.users.getMyUser);
  return {
    user,
    isLoading: user === undefined,
  };
}
