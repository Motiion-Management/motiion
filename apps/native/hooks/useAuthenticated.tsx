import { useConvexAuth } from 'convex/react';

export function useAuthenticated() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  return { isLoading, isAuthenticated };
}
