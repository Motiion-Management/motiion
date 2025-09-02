import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated'

import { Text } from '~/components/ui/text'
import ChevronLeft from '~/lib/icons/ChevronLeft'
import ChevronRight from '~/lib/icons/ChevronRight'

interface GestureTutorialProps {
  visible: boolean
  direction?: 'left' | 'right' | 'both'
  message?: string
  className?: string
}

export function GestureTutorial({ 
  visible, 
  direction = 'both', 
  message = 'Swipe to navigate between forms',
  className 
}: GestureTutorialProps) {
  const opacity = useSharedValue(0)
  const translateX = useSharedValue(0)
  const scale = useSharedValue(0.8)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 })
      scale.value = withTiming(1, { duration: 300 })
      
      // Animated swipe hint
      translateX.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: 800 }),
          withTiming(20, { duration: 800 }),
          withTiming(0, { duration: 400 })
        ),
        -1,
        false
      )
    } else {
      opacity.value = withTiming(0, { duration: 200 })
      scale.value = withTiming(0.8, { duration: 200 })
    }
  }, [visible, opacity, scale, translateX])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateX: translateX.value }
    ],
  }))

  const leftIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-20, 0, 20], [1, 0.3, 0.1]),
    transform: [{ scale: interpolate(translateX.value, [-20, 0], [1.2, 1]) }],
  }))

  const rightIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-20, 0, 20], [0.1, 0.3, 1]),
    transform: [{ scale: interpolate(translateX.value, [0, 20], [1, 1.2]) }],
  }))

  if (!visible) return null

  return (
    <Animated.View
      style={animatedStyle}
      className={`absolute bottom-20 left-0 right-0 items-center z-20 ${className}`}>
      <View className="bg-surface-default/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-border-default">
        <View className="flex-row items-center gap-4">
          {(direction === 'left' || direction === 'both') && (
            <Animated.View style={leftIconStyle}>
              <ChevronLeft size={20} className="color-icon-low" />
            </Animated.View>
          )}
          
          <Text variant="footnote" className="text-text-default text-center">
            {message}
          </Text>
          
          {(direction === 'right' || direction === 'both') && (
            <Animated.View style={rightIconStyle}>
              <ChevronRight size={20} className="color-icon-low" />
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  )
}