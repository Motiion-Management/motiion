import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'

const buttonVariants = cva(
  'rounded-full inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 *:transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        inverted:
          'bg-primary-foreground text-primary hover:bg-primary-foreground/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        outline:
          'border border-primary bg-transparent hover:bg-background hover:text-secondary',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 underline decoration-primary hover:decoration-primary/30 ',
        'accent-link': 'text-accent underline-offset-4 hover:underline',
        'destructive-link':
          'text-destructive hover:[&>svg]:fill-destructive/40  underline-offset-4 hover:underline',
        input:
          'rounded-lg border border-input bg-card dark:bg-input-background dark:text-input-foreground hover:bg-input/10',
        'image-upload':
          'rounded-lg border dark:border-input border-primary bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-input-background dark:text-input-foreground dark:hover:bg-input/10'
      },
      size: {
        default: 'h-11 px-8 py-2 text-link',
        input: 'h-11 px-3 py-2 text-body',
        sm: 'h-9 px-3 text-link-sm',
        min: 'h-min px-0 py-0 text-link-sm',
        icon: 'h-10 w-10',
        fab: 'h-auto w-auto p-2 rounded-full',
        container: 'h-full w-full text-link'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, loading, children, variant, size, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size: size || (variant === 'input' ? 'input' : 'default'),
            className
          }),
          loading && 'pointer-events-none animate-pulse'
        )}
        ref={ref}
        {...props}
      >
        {loading ? <LoaderCircle className="animate-spin" /> : children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
