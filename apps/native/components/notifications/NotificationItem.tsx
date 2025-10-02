import React from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { Text } from '~/components/ui/text'
import ChevronRight from '~/lib/icons/ChevronRight'

export interface NotificationItemProps {
  id: string
  name: string
  message: string
  timeAgo: string
  avatarUrl?: any
  isRead: boolean
  onPress?: () => void
}

export function NotificationItem({
  name,
  message,
  timeAgo,
  avatarUrl,
  isRead,
  onPress,
}: NotificationItemProps) {
  const bgClass = isRead ? 'bg-[rgba(21,25,28,0.8)]' : 'bg-surface-accent'
  const messageColorClass = isRead ? 'text-text-low' : 'text-accent'
  const nameVariant = isRead ? 'body' : 'header5'

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        className={`${bgClass} p-4 shadow-sm`}
        activeOpacity={0.7}>
        <View className="flex-row items-center justify-between">
          {/* Left side: Avatar + Content */}
          <View className="flex-1 flex-row items-center gap-2">
            {/* Avatar */}
            <View className="h-10 w-10 overflow-hidden rounded-full border border-border-tint">
              {avatarUrl ? (
                <Image source={avatarUrl} className="h-full w-full" resizeMode="cover" />
              ) : (
                <View className="h-full w-full items-center justify-center bg-surface-tint">
                  <Text variant="bodySm" className="text-text-default">
                    {name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>

            {/* Name + Message */}
            <View className="flex-1 gap-0.5">
              <Text variant={nameVariant} className="text-white">
                {name}
              </Text>
              <Text variant="bodyXs" className={messageColorClass}>
                {message}
              </Text>
            </View>
          </View>

          {/* Right side: Chevron + Time */}
          <View className="items-end gap-2">
            <ChevronRight className="h-6 w-6 color-white" />
            <Text variant="bodyXs" className="text-white">
              {timeAgo}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View className="h-px bg-border-tint" />
    </>
  )
}
