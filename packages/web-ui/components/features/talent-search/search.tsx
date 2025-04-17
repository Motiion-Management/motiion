'use client'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ChangeEvent, useCallback, useState } from 'react'
import debounce from 'lodash.debounce'
import { SearchResults } from './search-results'

export function TalentSearch() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const debouncedSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    return debounce(handleSearch, 300)(e)
  }, [])

  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 w-4" />
        <Input
          placeholder="Search for dance artists."
          className="text-primary pl-8"
          onChange={debouncedSearch}
        />
      </div>
      <SearchResults searchQuery={searchQuery} />
    </div>
  )
}
