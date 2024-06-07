import { FC } from 'react'
import { Button, ButtonProps } from './button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FABProps extends ButtonProps {
  iconSlot?: React.ReactNode
}

export const FAB: FC<FABProps> = ({
  iconSlot,
  variant = 'accent',
  className,
  ...rest
}) => {
  return (
    <Button
      size="fab"
      variant={variant}
      className={cn('absolute bottom-6 right-6 z-50 shadow-md', className)}
      {...rest}
    >
      {iconSlot || <Plus size={32} strokeWidth={2.5} />}
    </Button>
  )
}
