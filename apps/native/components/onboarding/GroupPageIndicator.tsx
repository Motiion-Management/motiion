import React from 'react'
import { View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated'

import { cn } from '~/lib/cn'

interface GroupPageIndicatorProps {
  totalPages: number
  currentPage: number
  progress?: number // 0-1 progress to next page
  className?: string
}

export function GroupPageIndicator({ 
  totalPages, 
  currentPage, 
  progress = 0, 
  className 
}: GroupPageIndicatorProps) {
  const animatedProgress = useSharedValue(progress)
  
  React.useEffect(() => {
    animatedProgress.value = withSpring(progress)
  }, [progress, animatedProgress])

  return (
    <View className={cn("flex-row items-center justify-center gap-2", className)}>
      {Array.from({ length: totalPages }, (_, index) => {
        const isActive = index === currentPage
        const isNext = index === currentPage + 1
        
        const animatedStyle = useAnimatedStyle(() => {
          let scale = 1
          let opacity = 0.3
          
          if (isActive) {
            scale = 1.2
            opacity = 1
          } else if (isNext) {
            scale = interpolate(animatedProgress.value, [0, 1], [1, 1.2])
            opacity = interpolate(animatedProgress.value, [0, 1], [0.3, 1])
          }
          
          return {
            transform: [{ scale: withSpring(scale) }],
            opacity: withSpring(opacity),
          }
        })
        
        return (
          <Animated.View
            key={index}
            style={animatedStyle}
            className={cn(
              "w-2 h-2 rounded-full",
              isActive 
                ? "bg-accent-primary" 
                : "bg-border-default"
            )}
          />
        )
      })}
    </View>
  )
}