import { Button, ButtonProps } from './button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'

export interface FABProps extends ButtonProps {
  iconSlot?: React.ReactNode
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ iconSlot, variant = 'accent', className, ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        size="fab"
        variant={variant}
        className={cn('fixed bottom-[120px] right-6 z-50 shadow-md', className)}
        {...rest}
      >
        {iconSlot || <Plus size={32} strokeWidth={2.5} />}
      </Button>
    )
  }
)

FAB.displayName = 'FAB'

export { FAB }
