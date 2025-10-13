import type { ViewRef } from '@rn-primitives/types'
import * as React from 'react'
import { View, type ViewProps } from 'react-native'
import { Image } from 'expo-image'

import { Text } from '~/components/ui/text'
import { Icon, type IconProps } from '~/lib/icons/Icon'
import { cn } from '~/lib/utils'

type ListContentType = 'Profile' | 'Text' | 'Icon' | 'Text + Icon' | 'Activity'

interface BaseListContentProps extends ViewProps {
  type: ListContentType
}

interface ProfileListContentProps extends BaseListContentProps {
  type: 'Profile'
  avatarUrl?: string
  name: string
}

interface TextListContentProps extends BaseListContentProps {
  type: 'Text'
  text: string
}

interface IconListContentProps extends BaseListContentProps {
  type: 'Icon'
  iconName?: IconProps['name']
}

interface TextIconListContentProps extends BaseListContentProps {
  type: 'Text + Icon'
  text: string
  iconName?: IconProps['name']
}

interface ActivityListContentProps extends BaseListContentProps {
  type: 'Activity'
  category: string
  activityType?: 'Session' | 'Class' | 'Job'
  activityLabel: string
}

type ListContentProps =
  | ProfileListContentProps
  | TextListContentProps
  | IconListContentProps
  | TextIconListContentProps
  | ActivityListContentProps

export const ListContent = React.forwardRef<ViewRef, ListContentProps>(
  ({ className, type, ...props }, ref) => {
    if (type === 'Profile') {
      const { avatarUrl, name } = props as ProfileListContentProps
      return (
        <View ref={ref} className={cn('flex-row items-center justify-between', className)} {...(props as ViewProps)}>
          <View className="flex-row items-center gap-2">
            {avatarUrl ? (
              <View className="h-8 w-8 overflow-hidden rounded-full border border-border-tint">
                <Image source={{ uri: avatarUrl }} contentFit="cover" style={{ width: 32, height: 32 }} />
              </View>
            ) : (
              <View className="h-8 w-8 items-center justify-center rounded-full border border-border-tint bg-surface-high">
                <Icon name="person.fill" size={16} className="text-icon-low" />
              </View>
            )}
            <Text variant="body" className="text-text-default">
              {name}
            </Text>
          </View>
          <Icon name="xmark" size={24} className="text-icon-low" />
        </View>
      )
    }

    if (type === 'Text') {
      const { text } = props as TextListContentProps
      return (
        <View ref={ref} className={cn('', className)} {...(props as ViewProps)}>
          <Text variant="body" className="text-text-default">
            {text}
          </Text>
        </View>
      )
    }

    if (type === 'Icon') {
      const { iconName = 'plus.circle' } = props as IconListContentProps
      return (
        <View ref={ref} className={cn('h-7 w-7 items-center justify-center', className)} {...(props as ViewProps)}>
          <Icon name={iconName} size={28} className="text-icon-default" />
        </View>
      )
    }

    if (type === 'Text + Icon') {
      const { text, iconName = 'plus.circle' } = props as TextIconListContentProps
      return (
        <View ref={ref} className={cn('flex-row items-center gap-2', className)} {...(props as ViewProps)}>
          <Text variant="body" className="text-text-default">
            {text}
          </Text>
          <View className="h-7 w-7 items-center justify-center">
            <Icon name={iconName} size={28} className="text-icon-default" />
          </View>
        </View>
      )
    }

    if (type === 'Activity') {
      const { category, activityType = 'Job', activityLabel } = props as ActivityListContentProps

      const activityColor =
        activityType === 'Session' ? 'text-[#cc00be]' :
        activityType === 'Class' ? 'text-[#00cc55]' :
        'text-[#4fcfcf]'

      return (
        <View ref={ref} className={cn('flex-col gap-2', className)} {...(props as ViewProps)}>
          <Text variant="bodySm" className="text-text-default">
            {category}
          </Text>
          <View className="flex-row items-center gap-1">
            <Icon name="arrow.turn.down.right" size={16} className="text-icon-low" />
            <Text variant="bodyLg" className={cn('font-normal', activityColor)}>
              {activityLabel}
            </Text>
          </View>
        </View>
      )
    }

    return null
  }
)

ListContent.displayName = 'ListContent'
