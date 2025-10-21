import { ReactNode } from 'react'
import { View } from 'react-native'
import Sortable from 'react-native-sortables'
import { LinearGradient } from 'expo-linear-gradient'

import XIcon from '~/lib/icons/X'
import { cn } from '~/lib/utils'
import { Text } from './text'

interface MediaCardProps {
  children: ReactNode
  onRemove?: () => void
  className?: string
  removable?: boolean
  // Overlay text options
  title?: string
  subtitle?: string
  overlayGradient?: boolean
}

export function MediaCard({
  children,
  onRemove,
  className,
  removable = true,
  title,
  subtitle,
  overlayGradient = true,
}: MediaCardProps) {
  const hasOverlay = title || subtitle

  return (
    <View className={cn('relative w-full', className)}>
      {children}

      {/* Bottom gradient overlay for text readability */}
      {hasOverlay && overlayGradient && (
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
          className="absolute bottom-0 left-0 right-0 h-32"
          pointerEvents="none"
        />
      )}

      {/* Overlay text */}
      {hasOverlay && (
        <View className="absolute bottom-0 left-0 right-0 gap-1 p-4">
          {subtitle && (
            <Text variant="label" className="text-text-low uppercase">
              {subtitle}
            </Text>
          )}
          {title && (
            <Text variant="body" className="text-text-default">
              {title}
            </Text>
          )}
        </View>
      )}

      {/* Remove button */}
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
