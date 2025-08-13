'use client'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'
import { cn } from '../../../lib/utils'
import { Checkbox } from '../checkbox'

export type MultiCheckboxOptions =
  | (string | { id: string; label: string })[]
  | readonly string[]

export type MultiCheckboxFieldProps<T extends MultiCheckboxOptions> = {
  name: string
  label?: string
  options: T
  className?: string
  // required?: boolean
}

export const MultiCheckboxField = <T extends MultiCheckboxOptions>({
  name,
  label = 'Select all that apply',
  className,
  options
  // required
}: MultiCheckboxFieldProps<T>) => {
  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className={cn('flex flex-col gap-3 px-6', className)}>
          <FormDescription className="text-body-xs">{label}</FormDescription>
          {options.map((optionMaybeString) => {
            const option =
              typeof optionMaybeString === 'string'
                ? { id: optionMaybeString, label: optionMaybeString }
                : optionMaybeString
            return (
              <FormField
                key={option.id}
                name={name}
                render={({ field }) => {
                  const isChecked = field.value?.includes(option.id)
                  const handleCheckboxChange = (checked: boolean) => {
                    return checked
                      ? field.onChange([...(field.value || []), option.id])
                      : field.onChange(
                          field.value?.filter(
                            (value: string) => value !== option.id
                          )
                        )
                  }
                  return (
                    <FormItem
                      key={option.id}
                      className={`cursor-pointer rounded-lg border-2 p-4 ${isChecked ? 'border-ring' : 'border-border'}`}
                    >
                      <FormControl>
                        <div
                          onClick={() => handleCheckboxChange(!isChecked)}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={handleCheckboxChange}
                          />
                          <FormLabel className="cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )
                }}
              />
            )
          })}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
