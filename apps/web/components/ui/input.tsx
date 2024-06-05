import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  iconSlot?: React.ReactNode
}

const classes = [
  'text-body-sm flex h-12 w-full rounded-lg border px-3 py-2 ',
  'text-foreground border-input bg-card dark:bg-input-background ring-offset-background placeholder:text-foreground/50',
  'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'file:border-0 file:bg-transparent  file:font-medium'
]

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, iconSlot, ...props }, ref) => {
    return (
      <div className="relative">
        {iconSlot && (
          <div className="*:text-primary absolute left-2 top-0 flex h-full items-center">
            {iconSlot}
          </div>
        )}

        <input
          type={type}
          className={cn(...classes, iconSlot && 'pl-10', className)}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
