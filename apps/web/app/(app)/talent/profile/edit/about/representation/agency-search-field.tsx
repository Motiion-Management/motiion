'use client'
import { Card, CardContent } from '@/components/ui/card'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { api } from '@packages/backend/convex/_generated/api'
import { AgencyDoc } from '@packages/backend/convex/agencies'
import { useQuery } from 'convex/react'
import { Search, XCircle } from 'lucide-react'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useController } from 'react-hook-form'
import { motion } from 'framer-motion'
import debounce from 'lodash.debounce'

export type AgencySearchFieldProps = {
  name: string
  label?: string
  required?: boolean
  className?: string
}

export const AgencySearchField: React.FC<AgencySearchFieldProps> = ({
  name,
  label = 'Agency Database',
  required,
  className
}) => {
  const { field } = useController({ name })

  const defaultAgency = useQuery(api.agencies.getAgency, {
    id: field.value
  })

  const [currentText, setCurrentText] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedAgency, setSelectedAgency] = useState<AgencyDoc | null>(
    (defaultAgency as AgencyDoc) || null
  )

  const searchResults = useQuery(api.agencies.search, {
    query: searchTerm
  })

  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const debouncedSearchTermChange = useMemo(() => {
    return debounce(handleSearchTermChange, 300)
  }, [])

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentText(e.target.value)
    debounce(handleSearchTermChange, 300)(e)
  }

  useEffect(() => {
    return () => {
      debouncedSearchTermChange.cancel()
    }
  })

  return (
    <FormItem className={className}>
      <FormLabel className="text-h6 flex items-center justify-between px-3">
        {label} {required && <span className="text-xs">Required</span>}
      </FormLabel>
      <div className="relative">
        <FormControl>
          <Input
            type="text"
            placeholder="Search for an agency..."
            defaultValue={defaultAgency?.name}
            value={selectedAgency?.name || currentText}
            leadingSlot={<Search size={20} />}
            trailingSlot={
              (searchTerm || selectedAgency) && (
                <XCircle
                  className="fill-primary stroke-card"
                  onClick={() => {
                    field.onChange(undefined)
                    setSelectedAgency(null)
                    setSearchTerm('')
                  }}
                />
              )
            }
            onChange={handleTextChange}
            onFocus={() => {
              field.onChange(undefined)
              setSelectedAgency(null)
              setSearchTerm((prev) => selectedAgency?.name || prev)
            }}
            onBlur={() => {
              setSearchTerm((prev) => selectedAgency?.name || prev.trim())
            }}
          />
        </FormControl>
        <motion.div
          animate={{ opacity: searchTerm ? 1 : 0 }}
          className="absolute left-0 right-0 top-full z-10 mt-1 w-full"
        >
          <Card>
            <CardContent className="py-4">
              <ScrollArea
                className={
                  '[&>[data-radix-scroll-area-viewport]]:max-h-[120px]'
                }
              >
                <div className="grid gap-2">
                  <ScrollBar forceMount />
                  {(!searchResults || searchResults?.length === 0) && (
                    <span className="text-body-xs text-foreground/50 px-3">
                      No results found.
                    </span>
                  )}
                  {searchResults?.map((agency) => (
                    <button
                      key={agency._id}
                      onClick={() => {
                        field.onChange(agency._id)
                        setSelectedAgency(agency)
                        setSearchTerm('')
                      }}
                      className="px-1 text-start"
                    >
                      <span>{agency.name}</span>
                      {agency.location?.city && (
                        <span> - {agency.location?.city}</span>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <FormMessage />
      <span className="text-body-xs text-foreground/50 px-3">
        If your agency is not listed in our database, enter the name of it
        manually in the next tab.
      </span>
    </FormItem>
  )
}
