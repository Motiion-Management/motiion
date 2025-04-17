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
import { FC } from 'react'

type InputFieldProps = {
  control?: ControllerProps['control']
  name: string
  label?: string
} & InputProps
export const InputField: FC<InputFieldProps> = ({
  control,
  name,
  placeholder,
  required,
  label = placeholder,
  ...rest
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center justify-between gap-2 px-3">
            {label && <h6 className="text-h6">{label}</h6>}
            {required && <span className="text-xs">Required</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} placeholder={placeholder} {...rest} />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
