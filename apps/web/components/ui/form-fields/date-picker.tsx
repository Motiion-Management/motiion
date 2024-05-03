'use client'

import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormDescription,
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
import { Input } from '../input'

export function DatePickerField({
  name,
  placeholder = 'MM/DD/YYYY',
  label
}: {
  name: string
  label: string
  placeholder?: string
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col ">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Input type="date" placeholder={placeholder} {...field} />

                {/* <Button */}
                {/*   variant={'input'} */}
                {/*   className={cn( */}
                {/*     'w-[240px] pl-3 text-left font-normal', */}
                {/*     !field.value && 'text-muted-foreground' */}
                {/*   )} */}
                {/* > */}
                {/*   {field.value ? ( */}
                {/*     format(field.value, 'PPP') */}
                {/*   ) : ( */}
                {/*     <span>Pick a date</span> */}
                {/*   )} */}
                {/*   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> */}
                {/* </Button> */}
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
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
