'use client'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import  {BreadcrumbEllipsis}  from '@/components/ui/breadcrumb'
export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const firstNameResults =
    useQuery(api.users.searchFirstNameUsers, { query: searchQuery }) || []
  const lastNameResults =
    useQuery(api.users.searchLastNameUsers, { query: searchQuery }) || []
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
      <div className="mt-5">
        {searchResults.map((user, index) => (
          <div className="flex items-center justify-between gap-3 my-5" key={index}>
            <div className="flex items-center gap-3">
            <Image
              className="rounded-full h-10 w-10 object-cover"
              src={user.headshot}
              alt={`${user.firstName} ${user.lastName}`}
              width={100}
              height={100}
            />
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
    </div>
  )
}
