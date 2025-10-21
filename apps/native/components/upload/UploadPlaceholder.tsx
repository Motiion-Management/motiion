import { ComponentType, ReactNode } from 'react'
import { Pressable, View } from 'react-native'

import ImageIcon from '~/lib/icons/Image'
import PlusIcon from '~/lib/icons/Plus'
import { cn } from '~/lib/utils'

interface UploadPlaceholderProps {
  onPress: () => void
  className?: string
  disabled?: boolean
  isActive?: boolean
  height?: number
  icon?: ComponentType<{ size: number; className?: string }>
  customContent?: ReactNode
}

export function UploadPlaceholder({
  onPress,
  className,
  disabled = false,
  isActive = true,
  height = 234,
  icon,
  customContent,
}: UploadPlaceholderProps) {
  const IconComponent = icon ?? (isActive ? PlusIcon : ImageIcon)

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'rounded border border-dashed',
        'flex items-center justify-center',
        'w-full',
        isActive
          ? 'border-border-accent bg-surface-high'
          : 'bg-buton-surface-disabled border-border-disabled',
        disabled && 'opacity-50',
        className
      )}
      style={{ height }}>
      {customContent ?? (
        <View className="items-center justify-center">
          <IconComponent
            size={24}
            className={isActive ? 'text-icon-default' : 'text-icon-disabled'}
          />
        </View>
      )}
    </Pressable>
  )
}
