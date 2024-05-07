'use client'
import './location.css'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'
import { PlaceKit } from '@placekit/autocomplete-react'

export type LocationFieldProps = {
  name: string
  label?: string
  required?: boolean
  className?: string
}
export function LocationField({
  name,
  label = 'Location',
  required,
  className
}: LocationFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center justify-between">
            {label} {required && <span className="text-xs">Required</span>}
          </FormLabel>
          <FormControl>
            <PlaceKit
              apiKey={`${process.env.NEXT_PUBLIC_PLACEKIT_KEY}`}
              geolocation={false}
              className="search-root"
              placeholder="Search for a city..."
              defaultValue={
                field.value && `${field.value.city}, ${field.value.state}`
              }
              onPick={(_, item) => {
                field.onChange({
                  country: item.country,
                  state: item.administrative,
                  city: item.city
                })
              }}
              options={{
                types: ['city', 'administrative'],
                panel: {
                  className: '!bg-black'
                },
                format: {
                  sub: (item) => `${item.city}, ${item.administrative}`,
                  value: (item) => `${item.city}, ${item.administrative}`
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
