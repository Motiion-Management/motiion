'use client'

import * as React from 'react'
import { Day, DayPicker, DayProps } from 'react-day-picker'
import './calendar.css'

import { cn } from '@/lib/utils'
import { Close } from '@radix-ui/react-popover'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const PopoverTriggerDay = (props: DayProps) => {
  return (
    <Close>
      <Day {...props} />
    </Close>
  )
}
function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      captionLayout="dropdown"
      fromYear={new Date().getFullYear() - 120}
      toDate={new Date()}
      components={{
        Day: PopoverTriggerDay
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
