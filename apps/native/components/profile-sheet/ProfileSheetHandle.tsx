import React from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated'
import { type ProfileSheetHandleProps } from './types'

export function ProfileSheetHandle({ animatedIndex }: ProfileSheetHandleProps) {
  const handleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [0, 1], Extrapolate.CLAMP)
    return { opacity }
  })

  return (
    <Animated.View style={[handleStyle]} className="items-center pb-2 pt-3">
      <View className="h-1 w-10 rounded-full bg-gray-400" />
    </Animated.View>
  )
}
