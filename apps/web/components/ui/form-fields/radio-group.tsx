'use client'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '../radio-group'

export type RadioGroupFieldProps = {
  name: string
  label?: string
  options: (string | { id: string; label: string })[]
  className?: string
  // required?: boolean
}
export const RadioGroupField = ({
  name,
  label = 'Select one',
  className,
  options
  // required
}: RadioGroupFieldProps) => {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col gap-3 px-6', className)}>
          <FormDescription className="text-body-xs">{label}</FormDescription>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {options.map((optionMaybeString) => {
                const option =
                  typeof optionMaybeString === 'string'
                    ? { id: optionMaybeString, label: optionMaybeString }
                    : optionMaybeString
                return (
                  <FormItem
                    className={`has-[span[data-state="checked"]]:border-ring border-border group flex cursor-pointer items-center rounded-lg border-2`}
                  >
                    <FormControl>
                      <RadioGroupItem value={option.id} className="" />
                    </FormControl>
                    <FormLabel className="text-body-sm !mt-0 flex-1 cursor-pointer py-4 pl-3">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                )
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
