'use client'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { BreadcrumbEllipsis } from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FC } from 'react'

export const SearchResults: FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const searchResults =
    useQuery(api.users.searchUsersByName, { query: searchQuery }) || []
  // const lastNameResults =
  //   useQuery(api.users.searchLastNameUsers, { query: searchQuery }) || []
  // const searchResults = [...firstNameResults, ...lastNameResults]

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
                src={user.headshot || undefined}
                alt={`${user.firstName} ${user.lastName}`}
              />

              <AvatarFallback>
                {user.firstName?.slice(0, 1)}
                {user.lastName?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>

            <div>
              {/* Render your result here. This is just a placeholder. */}
              <h2 className="text-lg font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-[#1c1d2099]"> {user.representation}</p>
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
