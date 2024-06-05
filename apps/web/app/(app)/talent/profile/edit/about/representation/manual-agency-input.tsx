'use client'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FC } from 'react'
import { useController } from 'react-hook-form'

export type ManualAgencyInputFieldProps = {
  name: string
  className?: string
}

export const ManualAgencyInput: FC<ManualAgencyInputFieldProps> = ({
  name,
  className
}) => {
  const { field } = useController({ name })
  return (
    <FormItem className={className}>
      <FormLabel className="text-h6 flex items-center justify-between px-3">
        Enter Representation
      </FormLabel>
      <FormControl>
        <Input
          type="text"
          placeholder="Enter the name of your representation..."
          {...field}
        />
      </FormControl>

      <FormMessage />
      <span className="text-body-xs text-foreground/50 px-3">
        The name will display on your profile exactly how it is entered.
      </span>
    </FormItem>
  )
}
