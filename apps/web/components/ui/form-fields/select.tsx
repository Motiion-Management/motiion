'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../select'

export type SelectFieldProps = {
  name: string
  label: string
  options: string[] | { value: string; label: string }[]
  className?: string
  placeholder?: string
  required?: boolean
}
export const SelectField = ({
  name,
  label,
  placeholder = 'Select',
  className,
  options,
  required
}: SelectFieldProps) => {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center justify-between text-sm">
            {label} {required && <span className="text-xs">Required</span>}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={placeholder} className="text-base" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => {
                if (typeof option === 'object') {
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )
                } else {
                  return (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  )
                }
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
