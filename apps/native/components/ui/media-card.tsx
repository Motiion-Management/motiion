import { ReactNode } from 'react'
import { View } from 'react-native'
import Sortable from 'react-native-sortables'

import XIcon from '~/lib/icons/X'
import { cn } from '~/lib/utils'

interface MediaCardProps {
  children: ReactNode
  onRemove?: () => void
  className?: string
  removable?: boolean
}

export function MediaCard({
  children,
  onRemove,
  className,
  removable = true,
}: MediaCardProps) {
  return (
    <View className={cn('relative w-full', className)}>
      {children}
      {removable && onRemove && (
        <View className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 shadow-sm">
          <Sortable.Touchable onTap={onRemove}>
            <XIcon size={12} className="text-white" />
          </Sortable.Touchable>
        </View>
      )}
    </View>
  )
}
