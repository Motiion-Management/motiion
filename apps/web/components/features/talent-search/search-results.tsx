'use client'
import { useStableQuery } from '@/lib/hooks/use-stable-query'
import { api } from '@packages/backend/convex/_generated/api'
import { motion } from 'framer-motion'

import { BreadcrumbEllipsis } from '@/components/ui/breadcrumb'
import { FC } from 'react'
import Image from 'next/image'
import { Initials } from './initials'
import Link from 'next/link'

export const SearchResults: FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const searchResults =
    useStableQuery(api.users.search, { query: searchQuery }) || []

  return (
    <motion.div
      className="bg-background/95 absolute left-0 z-10 -mx-6 mt-4 w-[calc(100%+3rem)] px-6"
      animate={{ opacity: searchQuery ? 1 : 0 }}
    >
      <div className="grid">
        {searchResults.map((user) => (
          <div
            className="my-5 flex items-center justify-between gap-3"
            key={user._id}
          >
            <Link
              className="flex items-center gap-3"
              href={`/talent/${user._id}`}
            >
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
            </Link>

            <BreadcrumbEllipsis />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
