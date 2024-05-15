import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'w-full flex flex-wrap rounded-lg border p-4 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:mt-0.5 gap-2',
  {
    variants: {
      variant: {
        default:
          'bg-background text-foreground [&>svg]:fill-foreground  [&>svg]:stroke-background',
        info: 'bg-muted text-muted-foreground [&>svg]:fill-muted-foreground  [&>svg]:stroke-muted',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:stroke-destructive [&>svg]:fill-destructive-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & { iconSlot?: React.ReactNode }
>(({ className, variant, iconSlot, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {iconSlot}
    <div className="flex flex-1 flex-row flex-wrap gap-2">{children}</div>
  </div>
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('text-h6 mb-1', className)} {...props} />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-body-sm flex-1 [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
