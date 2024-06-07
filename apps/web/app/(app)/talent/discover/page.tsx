'use client'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'
import { SearchResults } from './search-results'

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const debouncedSearch = useMemo(() => {
    return debounce(handleSearch, 300)
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  })

  return (
    <div className="flex flex-col gap-2">
      <h1>Discover</h1>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 w-4" />
        <Input
          type="text"
          placeholder="Search for dance artists."
          className="text-primary pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
          onChange={debouncedSearch}
        />
        {searchQuery && <SearchResults searchQuery={searchQuery} />}
      </div>
    </div>
  )
}
