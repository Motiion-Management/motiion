'use client'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { BreadcrumbEllipsis } from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FC } from 'react'
import { AgencyName } from '@/components/features/agencies/agency-name'

export const SearchResults: FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const searchResults = useQuery(api.users.search, { query: searchQuery }) || []

  return (
    <div className="mt-5">
      {searchResults.map((user, index) => (
        <div
          className="my-5 flex items-center justify-between gap-3"
          key={index}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={user.headshot?.url || undefined}
                alt={`${user.fullName}`}
              />

              <AvatarFallback>
                {user.firstName?.slice(0, 1)}
                {user.lastName?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>

            <div>
              {/* Render your result here. This is just a placeholder. */}
              <h2 className="text-lg font-bold">{user.fullName}</h2>
              {user.representation?.agencyId && (
                <AgencyName id={user.representation.agencyId} />
              )}
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
