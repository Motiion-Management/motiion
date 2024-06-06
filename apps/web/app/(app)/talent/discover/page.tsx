'use client'
import { fetchQuery } from 'convex/nextjs'
import { useQuery, useQueries } from 'convex/react'
import { getAuthToken } from '@/lib/server/utils'
import { searchFirstNameUsers, searchLastNameUsers } from '@packages/backend/convex/users'
import { api } from '@packages/backend/convex/_generated/api'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import {
  getPublicResume,
  getUserHeadshots
} from '@packages/backend/convex/resumes'
export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const firstNameResults = useQuery(api.users.searchFirstNameUsers, { query: searchQuery }) || []
  const lastNameResults = useQuery(api.users.searchLastNameUsers, { query: searchQuery }) || []
  const searchResults = [...firstNameResults, ...lastNameResults]
  const handleSearch = (e) => {
    console.log(searchResults)
    setSearchQuery(e.target.value)
  }


  return (
    <div className="flex flex-col gap-2">
      <h1>Discover</h1>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 w-4" />
        <Input
          type="search"
          placeholder="Search for dance artists."
          className="text-primary pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div>
        {searchResults.map((user, index) => (
          <div key={index}>
            {/* Render your result here. This is just a placeholder. */}
            <h2 className="text-lg font-bold">
              {user.firstName} {user.lastName}
              {user.representation}
              <Image
                src={user.headshot}
                alt={`${user.firstName} ${user.lastName}`}
                width={100}
                height={100}
              />
            </h2>
          </div>
        ))}
      </div>
    </div>
  )
}
