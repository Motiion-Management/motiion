'use client'
import { useStableQuery } from '@/lib/hooks/use-stable-query'
import { api } from '@packages/backend/convex/_generated/api'

import { BreadcrumbEllipsis } from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FC } from 'react'

export const SearchResults: FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const searchResults =
    useStableQuery(api.users.search, { query: searchQuery }) || []

  return (
    <div className="mt-5 grid">
      {searchResults.map((user) => (
        <div
          className="my-5 flex items-center justify-between gap-3"
          key={user._id}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={user.headshot?.url || undefined}
                alt={`${user.fullName}`}
              />

              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-lg font-bold">{user.fullName}</h2>
              {user.representationName}
            </div>
          </div>

          <div>
            <BreadcrumbEllipsis />
          </div>
        </div>
      ))}
    </div>
  )
}
