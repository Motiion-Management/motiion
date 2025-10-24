import { useQuery } from '@tanstack/react-query'
import { type Id } from '@packages/backend/convex/_generated/dataModel'
import { dancerProfileQueryOptions } from './dancerProfileQueries'
import { useStableTanstackData } from './useStableTanstackData'

/**
 * Hook to fetch dancer profile data with details using TanStack Query + Convex adapter.
 *
 * Features:
 * - Real-time updates via Convex WebSocket subscription
 * - Stable data that never becomes undefined after initial load
 * - Prevents UI flashes during refetches
 * - Supports prefetching before navigation for instant transitions
 *
 * Usage:
 * 1. Prefetch before navigation: `queryClient.prefetchQuery(dancerProfileQueryOptions(id))`
 * 2. Query in component: `const query = useDancerProfileQuery(id)`
 * 3. Check loading state: `query.isPending && !query.isStable` (first load only)
 * 4. Check error state: `query.isError`
 * 5. Access data: `query.data` (never undefined after first load)
 *
 * @param dancerId - The ID of the dancer profile to fetch
 * @returns Extended query result with stable data and isStable flag
 *
 * @example
 * ```tsx
 * function DancerScreen({ id }: { id: Id<'dancers'> }) {
 *   const query = useDancerProfileQuery(id)
 *
 *   if (query.isPending && !query.isStable) {
 *     return <ProfileSkeleton />
 *   }
 *
 *   if (query.isError) {
 *     return <ErrorState error={query.error} onRetry={query.refetch} />
 *   }
 *
 *   return <ProfileContent data={query.data} />
 * }
 * ```
 */
export function useDancerProfileQuery(dancerId: Id<'dancers'>) {
  const query = useQuery(dancerProfileQueryOptions(dancerId))
  return useStableTanstackData(query)
}
