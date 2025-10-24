import { useRef } from 'react'
import { type UseQueryResult } from '@tanstack/react-query'

/**
 * Wraps a TanStack Query result to provide stable data that never becomes undefined.
 *
 * This hook prevents UI flashes during refetches by holding onto the last known data.
 * When combined with `placeholderData: (prev) => prev` in query options, this ensures
 * smooth transitions and prevents loading states from appearing unnecessarily.
 *
 * Use case: ProfileSheet needs to stay rendered during background refetches to support
 * shared element transitions and animated content updates.
 *
 * @param query - The TanStack Query result to stabilize
 * @returns Extended query result with stable data and isStable flag
 *
 * @example
 * ```ts
 * const query = useQuery(dancerProfileQueryOptions(dancerId))
 * const stableQuery = useStableTanstackData(query)
 *
 * // stableQuery.data is never undefined after first load
 * // stableQuery.isStable tells you if we have any data yet
 * if (!stableQuery.isStable) {
 *   return <Skeleton />
 * }
 * return <Profile data={stableQuery.data} />
 * ```
 */
export function useStableTanstackData<TData>(query: UseQueryResult<TData>) {
  const stableRef = useRef<TData | undefined>(undefined)

  // Update stable data when query returns new data
  if (query.data !== undefined) {
    stableRef.current = query.data
  }

  return {
    ...query,
    data: stableRef.current,
    isStable: stableRef.current !== undefined,
  }
}
