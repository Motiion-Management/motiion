'use client'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '../button'
import { z } from 'zod'

export const zDateStringResolver = z.date().transform((date, ctx) => {
  if (!z.date().safeParse(date).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_date
    })
  }
  return date.toDateString()
})

export function DatePickerField({
  name,
  label,
  placeholder = 'Pick a Date',
  className
}: {
  name: string
  label: string
  placeholder?: string
  className?: string
}) {
  return (
    <FormField
      name={name}
      render={({ field: { value, onChange } }) => (
        <FormItem className={cn('flex w-full flex-wrap', className)}>
          <FormLabel className="basis-full">{label}</FormLabel>
          <Popover>
            <div className={'relative flex w-full basis-full'}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'input'}
                    className={cn(
                      'w-full basis-full',
                      !value && 'text-muted-foreground'
                    )}
                  >
                    {value ? format(value, 'PPP') : <span>{placeholder}</span>}
                    <CalendarIcon className="stroke-muted-foreground ml-auto" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
            </div>

            <PopoverContent
              className="my-auto h-fit w-full sm:w-auto"
              sideOffset={-50}
              align="start"
              side="bottom"
              collisionPadding={10}
            >
              <Calendar
                mode="single"
                defaultMonth={value || new Date()}
                selected={value}
                onSelect={onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
