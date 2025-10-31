import { api } from '@packages/backend/convex/_generated/api';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { useStableTanstackData } from '~/hooks/queries/useStableTanstackData';

export interface DancerCardData {
  _id: string;
  _creationTime: number;
  displayName: string;
  userId: string;
  headshotUrl: string | null;
}

export interface DancersListResult {
  dancers: Array<DancerCardData>;
  continueCursor: string | null;
  isDone: boolean;
}

/**
 * Query options factory for fetching paginated dancer list
 */
export function dancersListQueryOptions(limit = 5, cursor?: string | null) {
  return {
    ...convexQuery(api.dancers.listDiscoverDancers, { limit, cursor: cursor ?? null }),
    // Stable key for this specific query
    staleTime: 1000 * 60 * 5, // 5 minutes
  };
}

/**
 * Hook to fetch paginated list of dancers for discover page
 */
export function useDancersListQuery(limit = 5, cursor?: string | null) {
  const query = useQuery(dancersListQueryOptions(limit, cursor));

  // Wrap with stable data helper to prevent undefined flashes
  return useStableTanstackData(query);
}
