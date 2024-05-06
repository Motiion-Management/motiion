'use client'
import { ControllerProps } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'
import { Input, InputProps } from '../input'

type InputFieldProps = {
  control?: ControllerProps['control']
  name: string
  label?: string
} & InputProps
export function InputField({
  control,
  name,
  placeholder,
  required,
  label = placeholder,
  ...rest
}: InputFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center justify-between gap-2 text-sm">
            {label}
            {required && <span className="text-xs">Required</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              required={required}
              {...rest}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
