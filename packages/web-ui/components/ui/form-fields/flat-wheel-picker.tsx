'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'

import Picker from 'react-mobile-picker'

export type FlatWheelPickerColumnValues =
  | (string | number)[]
  | readonly string[]
  | readonly number[]

export type FlatWheelPickerFieldProps<T extends FlatWheelPickerColumnValues> = {
  name: string
  label?: string
  className?: string
  required?: boolean
  options: T
}

export const FlatWheelPickerField = <T extends FlatWheelPickerColumnValues>({
  name,
  label,
  className,
  options,
  required
}: FlatWheelPickerFieldProps<T>) => {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center justify-between text-sm">
            {label} {required && <span className="text-xs">Required</span>}
          </FormLabel>
          <FormControl>
            <Picker
              wheelMode="normal"
              value={{ [name]: field.value }}
              onChange={(value) => field.onChange(value[name])}
              className="flex gap-4 px-10"
            >
              <Picker.Column name={name} key={name} className="pl-5 pr-4">
                {options.map((option) => (
                  <Picker.Item value={option} key={option}>
                    {({ selected }) => (
                      <div
                        className={
                          selected
                            ? 'text-foreground text-h5'
                            : 'text-foreground/50'
                        }
                      >
                        {option}
                      </div>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
