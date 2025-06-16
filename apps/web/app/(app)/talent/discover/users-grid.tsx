'use client'
import { FC } from 'react'
import { usePaginatedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { DiscoverProfileCard } from './profile-card'
import { Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const UsersGrid: FC = () => {
  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.users.paginateProfiles,
    {},
    { initialNumItems: 5 }
  )

  return (
    <div className="grid grid-cols-2 gap-2">
      <h2 className="text-h5 col-span-2">The Community</h2>
      {results?.map((profile, index) => (
        <DiscoverProfileCard key={profile.headshotUrl + index} {...profile} />
      ))}
      <div className="col-span-2 grid justify-center">
        {isLoading ? (
          <Loader size={24} className="animate-spin" />
        ) : (
          status === 'CanLoadMore' && (
            <Button variant="link" className="" onClick={() => loadMore(5)}>
              Load More
            </Button>
          )
        )}
      </div>
    </div>
  )
}
