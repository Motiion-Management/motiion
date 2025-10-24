import { convexQuery } from '@convex-dev/react-query'
import { api } from '@packages/backend/convex/_generated/api'
import { type Id } from '@packages/backend/convex/_generated/dataModel'

/**
 * Query options factory for dancer profile data with details.
 *
 * Features:
 * - Uses Convex adapter for live real-time updates via WebSocket
 * - placeholderData keeps last known data during refetch (prevents flashes)
 * - gcTime of 5 minutes keeps subscription alive during navigation
 * - Used for prefetching before navigation and querying in components
 *
 * @param dancerId - The ID of the dancer profile to fetch
 * @returns TanStack Query options configured for Convex
 */
export function dancerProfileQueryOptions(dancerId: Id<'dancers'>) {
  return {
    ...convexQuery(api.dancers.getDancerProfileWithDetails, { dancerId }),
    placeholderData: (previousData: any) => previousData,
    gcTime: 5 * 60 * 1000, // 5 minutes
  }
}
