import React, { useEffect } from 'react'
import { TouchableOpacity, View, Linking } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay
} from 'react-native-reanimated'
import { Icon } from '~/lib/icons/Icon'
import { cn } from '~/lib/utils'

type ViewerType = 'self' | 'dancer' | 'choreographer'

interface ProfileActionButtonsProps {
  isExpanded: boolean
  onToggle: () => void
  viewerType: ViewerType
  dancerEmail?: string
  className?: string
}

export function ProfileActionButtons({
  isExpanded,
  onToggle,
  viewerType,
  dancerEmail,
  className
}: ProfileActionButtonsProps) {
  const calendarOpacity = useSharedValue(0)
  const calendarTranslateY = useSharedValue(20)
  const addOpacity = useSharedValue(0)
  const addTranslateY = useSharedValue(20)

  useEffect(() => {
    if (isExpanded) {
      // Stagger animations when expanding
      calendarOpacity.value = withDelay(50, withSpring(1))
      calendarTranslateY.value = withDelay(50, withSpring(0))
      addOpacity.value = withDelay(100, withSpring(1))
      addTranslateY.value = withDelay(100, withSpring(0))
    } else {
      // Collapse immediately
      calendarOpacity.value = withSpring(0)
      calendarTranslateY.value = withSpring(20)
      addOpacity.value = withSpring(0)
      addTranslateY.value = withSpring(20)
    }
  }, [isExpanded])

  const calendarStyle = useAnimatedStyle(() => ({
    opacity: calendarOpacity.value,
    transform: [{ translateY: calendarTranslateY.value }]
  }))

  const addStyle = useAnimatedStyle(() => ({
    opacity: addOpacity.value,
    transform: [{ translateY: addTranslateY.value }]
  }))

  const handleBookingPress = () => {
    if (dancerEmail) {
      Linking.openURL(`mailto:${dancerEmail}?subject=Booking Inquiry`)
    }
  }

  const handleAddToListPress = () => {
    // TODO: Implement add to list functionality
    console.log('Add to list pressed')
  }

  // TODO: Implement self-view buttons (share, edit, etc)
  // Reference design: https://www.figma.com/design/XsSFnEl8pmOL7KMKq2ofx3/Mobile-App?node-id=3158-33966&m=dev

  return (
    <View className={cn('items-center gap-2', className)}>
      {/* Expanded action buttons (only for non-self viewers) */}
      {isExpanded && viewerType !== 'self' && (
        <View className="gap-2">
          {/* Calendar/Booking button */}
          <Animated.View style={calendarStyle}>
            <TouchableOpacity
              onPress={handleBookingPress}
              className={cn(
                'h-12 w-12 items-center justify-center rounded-full',
                isExpanded ? 'bg-surface-accent' : 'bg-surface-default'
              )}>
              <Icon
                name="calendar.badge.plus"
                size={24}
                className={isExpanded ? 'text-icon-accent' : 'text-icon-default'}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Add to list button */}
          <Animated.View style={addStyle}>
            <TouchableOpacity
              onPress={handleAddToListPress}
              className={cn(
                'h-12 w-12 items-center justify-center rounded-full',
                isExpanded ? 'bg-surface-accent' : 'bg-surface-default'
              )}>
              <Icon
                name="plus"
                size={24}
                className={isExpanded ? 'text-icon-accent' : 'text-icon-default'}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Kebab menu button */}
      <TouchableOpacity
        onPress={onToggle}
        className={cn(
          'h-12 w-12 items-center justify-center rounded-full',
          isExpanded ? 'bg-surface-accent' : 'bg-surface-default'
        )}>
        <Icon
          name="ellipsis"
          size={24}
          className={isExpanded ? 'text-icon-accent' : 'text-icon-default'}
        />
      </TouchableOpacity>
    </View>
  )
}
