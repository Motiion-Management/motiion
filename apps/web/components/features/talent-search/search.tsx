'use client'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'
import { SearchResults } from './search-results'
import { motion } from 'framer-motion'

export function TalentSearch() {
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
  }, [debouncedSearch])

  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 w-4" />
        <Input
          type="text"
          placeholder="Search for dance artists."
          className="text-primary pl-8"
          onChange={debouncedSearch}
        />
      </div>
      <motion.div
        className="bg-background/60 absolute left-0 z-10 -ml-4 mt-8 w-screen p-4"
        animate={{ opacity: searchQuery ? 1 : 0 }}
      >
        <SearchResults searchQuery={searchQuery} />
      </motion.div>
    </div>
  )
}
