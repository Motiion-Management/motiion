import React from 'react'
import { Pressable } from 'react-native'

import { Text } from './text'
import { cn } from '~/lib/cn'

export interface AddLocationButtonProps {
  onPress: () => void
  disabled?: boolean
  className?: string
}

export function AddLocationButton({
  onPress,
  disabled = false,
  className
}: AddLocationButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'flex-row items-center justify-center py-4',
        disabled && 'opacity-50',
        className
      )}
      style={({ pressed }) => ({
        opacity: pressed && !disabled ? 0.7 : disabled ? 0.5 : 1
      })}
    >
      <Text className={cn(
        'text-[16px] font-medium text-text-default',
        disabled && 'text-text-low'
      )}>
        Add a location
      </Text>
    </Pressable>
  )
}