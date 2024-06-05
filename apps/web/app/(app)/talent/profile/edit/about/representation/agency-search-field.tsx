'use client'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { api } from '@packages/backend/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Search } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import { useController } from 'react-hook-form'

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

  const [searchTerm, setSearchTerm] = useState<string>('')

  const searchResults =
    useQuery(api.agencies.search, {
      query: searchTerm
    }) || []

  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    setSearchTerm(e.target.value)
  }
  return (
    <FormItem className={className}>
      <Popover open={searchResults.length > 0}>
        <FormLabel className="text-h6 flex items-center justify-between px-3">
          {label} {required && <span className="text-xs">Required</span>}
        </FormLabel>
        <PopoverTrigger asChild>
          <FormControl>
            <Input
              type="search"
              placeholder="Search for an agency..."
              iconSlot={<Search size={20} />}
              defaultValue={defaultAgency?.name}
              onChange={handleSearchTermChange}
            />
          </FormControl>
        </PopoverTrigger>
        <FormMessage />
        <span className="text-body-xs text-foreground/50 px-3">
          If your agency is not listed in our database, enter the name of it
          manually in the next tab.
        </span>
        <PopoverContent
          className="mt-1 grid w-[calc(100dvw-2rem)] gap-2 "
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {searchResults.map((agency) => (
            <button
              key={agency._id}
              onClick={() => field.onChange(agency._id)}
              className="bg-background/50 rounded-lg"
            >
              <span>{agency.name}</span>
              {agency.location?.city && <span> - {agency.location?.city}</span>}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </FormItem>
  )
}
