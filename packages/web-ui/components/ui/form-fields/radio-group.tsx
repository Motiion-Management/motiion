'use client'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'
import { cn } from '../../lib/utils'
import { RadioGroup, RadioGroupItem } from '../radio-group'

export type RadioGroupOptions =
  | (string | { id: string; label: string })[]
  | readonly string[]

export type RadioGroupFieldProps<T extends RadioGroupOptions> = {
  name: string
  label?: string
  options: T
  className?: string
  // required?: boolean
}
export const RadioGroupField = <T extends RadioGroupOptions>({
  name,
  label = 'Select one',
  className,
  options
  // required
}: RadioGroupFieldProps<T>) => {
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
                    key={option.id}
                    className={`has-[span[data-state="checked"]]:border-ring border-border group cursor-pointer flex-row items-center rounded-lg border-2`}
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
