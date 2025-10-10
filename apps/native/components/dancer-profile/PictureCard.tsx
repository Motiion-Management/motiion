import React from 'react'
import { ImageBackground, View, TouchableOpacity, type ViewStyle } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { cn } from '~/lib/utils'

interface PictureCardProps {
  imageUrl: string | null
  children?: React.ReactNode
  onPress?: () => void
  onSwipeDown?: () => void
  style?: ViewStyle
  className?: string
}

export function PictureCard({
  imageUrl,
  children,
  onPress,
  onSwipeDown,
  style,
  className
}: PictureCardProps) {
  // Gesture for swipe down
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.velocityY > 500 && onSwipeDown) {
        onSwipeDown()
      }
    })

  const content = (
    <View
      style={[
        {
          width: 453,
          height: 601,
          marginLeft: -23,
          borderRadius: 12,
          overflow: 'hidden'
        },
        style
      ]}
      className={cn('shadow-lg', className)}>
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={{ flex: 1 }}
          resizeMode="cover">
          {children}
        </ImageBackground>
      ) : (
        <View className="flex-1 bg-surface-high items-center justify-center">
          {children}
        </View>
      )}
    </View>
  )

  if (onSwipeDown) {
    return (
      <GestureDetector gesture={swipeGesture}>
        <Animated.View>
          {onPress ? (
            <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
              {content}
            </TouchableOpacity>
          ) : (
            content
          )}
        </Animated.View>
      </GestureDetector>
    )
  }

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}
