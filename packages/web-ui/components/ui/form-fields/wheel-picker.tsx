'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'

import Picker from 'react-mobile-picker'

export type WheelPickerColumnValues =
  | (string | number)[]
  | readonly string[]
  | readonly number[]

export type WheelPickerFieldProps<T extends WheelPickerColumnValues> = {
  name: string
  label?: string
  className?: string
  required?: boolean
  options: {
    [column: string]: { values: T; unit?: string }
  }
}

export const WheelPickerField = <T extends WheelPickerColumnValues>({
  name,
  label,
  className,
  options,
  required
}: WheelPickerFieldProps<T>) => {
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
              value={field.value || {}}
              onChange={field.onChange}
              className="flex gap-4 px-10"
            >
              {Object.keys(options).map((column) => (
                <div className="flex gap-0" key={column}>
                  <Picker.Column
                    name={column}
                    key={column}
                    className="pl-5 pr-4"
                  >
                    {options?.[column].values.map((option) => (
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
                  <div className="text-h5 mt-[6.05rem]">
                    {options?.[column].unit || column}
                  </div>
                </div>
              ))}
            </Picker>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
