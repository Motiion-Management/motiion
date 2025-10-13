import React, { useEffect } from 'react'
import { TouchableOpacity, View, Linking } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay
} from 'react-native-reanimated'
import { Icon } from '~/lib/icons/Icon'

type ViewerType = 'self' | 'dancer' | 'choreographer'

interface ProfileActionButtonsProps {
  isExpanded: boolean
  onToggle: () => void
  viewerType: ViewerType
  dancerEmail?: string
}

export function ProfileActionButtons({
  isExpanded,
  onToggle,
  viewerType,
  dancerEmail
}: ProfileActionButtonsProps) {
  const calendarOpacity = useSharedValue(0)
  const calendarTranslateY = useSharedValue(-20)
  const addOpacity = useSharedValue(0)
  const addTranslateY = useSharedValue(-20)

  useEffect(() => {
    if (isExpanded) {
      // Stagger animations when expanding - animate UP
      addOpacity.value = withDelay(50, withSpring(1))
      addTranslateY.value = withDelay(50, withSpring(0))
      calendarOpacity.value = withDelay(100, withSpring(1))
      calendarTranslateY.value = withDelay(100, withSpring(0))
    } else {
      // Collapse immediately
      calendarOpacity.value = withSpring(0)
      calendarTranslateY.value = withSpring(-20)
      addOpacity.value = withSpring(0)
      addTranslateY.value = withSpring(-20)
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
    <View
      style={{
        position: 'absolute',
        right: 16,
        top: 0,
        height: 194,
        width: 58,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <View style={{ gap: 8, alignItems: 'center' }}>
        {/* Expanded action buttons (only for non-self viewers) */}
        {isExpanded && viewerType !== 'self' && (
          <>
            {/* Calendar/Booking button */}
            <Animated.View style={calendarStyle}>
              <TouchableOpacity
                onPress={handleBookingPress}
                className="h-12 w-12 items-center justify-center rounded-full bg-surface-default shadow-sm">
                <Icon
                  name="calendar.badge.plus"
                  size={24}
                  className="text-icon-default"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Add to list button */}
            <Animated.View style={addStyle}>
              <TouchableOpacity
                onPress={handleAddToListPress}
                className="h-12 w-12 items-center justify-center rounded-full bg-surface-default shadow-sm">
                <Icon name="plus" size={24} className="text-icon-default" />
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        {/* Kebab menu button */}
        <TouchableOpacity
          onPress={onToggle}
          className="h-12 w-12 items-center justify-center rounded-full bg-surface-default shadow-sm">
          <Icon name="ellipsis" size={24} className="text-icon-default" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
