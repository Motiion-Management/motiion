'use client'
import { fetchQuery } from 'convex/nextjs'
import { useQuery } from 'convex/react'
import { getAuthToken } from '@/lib/server/utils'
import { searchUsers } from '@packages/backend/convex/users'
import { api } from '@packages/backend/convex/_generated/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react';
export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useQuery(api.users.searchUsers, { query: searchQuery }) || [];
  const handleSearch = (e) =>{
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
          className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] text-primary"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
    </div>
  );
}
