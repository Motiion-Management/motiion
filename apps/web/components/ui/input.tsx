import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingSlot?: React.ReactNode
  trailingSlot?: React.ReactNode
}

const classes = [
  // text-body and no smaller, otherwise inputs will zoom in when tapped on mobile.
  'text-body flex h-12 w-full rounded-lg border px-3 py-2 ',
  'text-foreground border-input bg-card dark:bg-input-background ring-offset-background placeholder:text-foreground/50',
  'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'file:border-0 file:bg-transparent  file:font-medium'
]

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leadingSlot, trailingSlot, ...props }, ref) => {
    return (
      <div className="relative flex-1">
        {leadingSlot && (
          <div className="*:text-primary absolute left-2 top-0 flex h-full items-center">
            {leadingSlot}
          </div>
        )}

        <input
          type={type}
          className={cn(
            ...classes,
            leadingSlot && 'pl-10',
            trailingSlot && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {trailingSlot && (
          <div className="*:text-primary absolute right-2 top-0 flex h-full items-center">
            {trailingSlot}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
