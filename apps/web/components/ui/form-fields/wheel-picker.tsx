'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'

import Picker from 'react-mobile-picker'

export type WheelPickerFieldProps = {
  name: string
  label: string
  className?: string
  required?: boolean
  options: { [column: string]: (string | number)[] }
}
export const WheelPickerField = ({
  name,
  label,
  className,
  options,
  required
}: WheelPickerFieldProps) => {
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
              className="flex gap-8 px-10"
            >
              {Object.keys(options).map((column) => (
                <div className="flex gap-2" key={column}>
                  <Picker.Column name={column} key={column} className="">
                    {options?.[column].map((option) => (
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
                  <div className="text-h5 mt-[6.05rem]">{column}</div>
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
