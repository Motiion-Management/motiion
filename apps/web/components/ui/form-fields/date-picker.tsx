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
// import { Input } from '../input'
import { Button } from '../button'

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
              {/* Render native picker on touch devices (ios, android) (devices that don't support "hover" specifically) */}
              {/* <FormControl> */}
              {/*   <Input */}
              {/*     className="no-touch:hidden z-10 w-full basis-full opacity-0" */}
              {/*     type="date" */}
              {/*     max={new Date().getDate()} */}
              {/*     // value={value} */}
              {/*     onChange={(e) => {}} */}
              {/*     {...field} */}
              {/*   /> */}
              {/* </FormControl> */}
              {/* <div className="no-touch:hidden z-1 absolute right-0 top-0 flex h-full w-full items-center justify-end px-4"> */}
              {/*   <CalendarIcon className="stroke-muted-foreground my-auto " /> */}
              {/* </div> */}
              {/**/}
              {/* <Input */}
              {/*   className={cn( */}
              {/*     'no-touch:hidden pointer-events-none absolute left-0 top-0 z-0 flex h-full w-full items-center justify-center text-sm', */}
              {/*     value ? 'text-input-foreground' : 'text-muted-foreground' */}
              {/*   )} */}
              {/*   placeholder="Enter Date of Birth" */}
              {/*   value={value ? format(value, 'PPP') : ''} */}
              {/*   onChange={(e) => { */}
              {/*     console.log(e) */}
              {/*     onChange(e) */}
              {/*   }} */}
              {/*   {...field} */}
              {/* /> */}

              {/* Render the Calendar component in a popover on all others (devices that do support "hover" specifically) */}
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
                onSelect={(props) => {
                  onChange(props)
                }}
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
