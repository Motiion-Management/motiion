'use client'
import { useStableQuery } from '@/lib/hooks/use-stable-query'
import { api } from '@packages/backend/convex/_generated/api'
import { motion } from 'framer-motion'

import { BreadcrumbEllipsis } from '@/components/ui/breadcrumb'
import { FC } from 'react'
import Image from 'next/image'
import { Initials } from './initials'

export const SearchResults: FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const searchResults =
    useStableQuery(api.users.search, { query: searchQuery }) || []

  return (
    <motion.div
      className="bg-background/60 absolute left-0 z-10 -ml-4 mt-8 w-screen p-4"
      animate={{ opacity: searchQuery ? 1 : 0 }}
    >
      <div className="mt-5 grid">
        {searchResults.map((user) => (
          <div
            className="my-5 flex items-center justify-between gap-3"
            key={user._id}
          >
            <div className="flex items-center gap-3">
              {user.headshot?.url ? (
                <Image
                  width={40}
                  height={40}
                  className="aspect-square rounded-full object-cover"
                  src={user.headshot?.url || ''}
                  alt={`${user.fullName}`}
                />
              ) : (
                <Initials firstName={user.firstName} lastName={user.lastName} />
              )}

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
    </motion.div>
  )
}
