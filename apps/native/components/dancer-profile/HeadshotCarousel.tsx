import React, { useState } from 'react'
import { View, Image, Dimensions, TouchableOpacity } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import { Text } from '~/components/ui/text'
import { Icon } from '~/lib/icons/Icon'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface HeadshotCarouselProps {
  headshotUrls: Array<string>
  initialIndex?: number
  onClose: () => void
}

export function HeadshotCarousel({
  headshotUrls,
  initialIndex = 0,
  onClose
}: HeadshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const closeButtonOpacity = useSharedValue(1)

  const closeButtonStyle = useAnimatedStyle(() => ({
    opacity: closeButtonOpacity.value
  }))

  if (headshotUrls.length === 0) return null

  return (
    <View className="flex-1 bg-black">
      {/* Header with title */}
      <View className="absolute left-0 right-0 top-0 z-10 pt-16">
        <View className="items-center">
          <Text variant="header4" className="text-white">
            Headshots
          </Text>
        </View>
      </View>

      {/* Carousel */}
      <View className="flex-1 items-center justify-center">
        <Carousel
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT * 0.7}
          data={headshotUrls}
          defaultIndex={initialIndex}
          onSnapToItem={setCurrentIndex}
          renderItem={({ item }) => (
            <View className="flex-1 items-center justify-center px-4">
              <Image
                source={{ uri: item }}
                style={{ width: SCREEN_WIDTH - 32, height: SCREEN_HEIGHT * 0.7 }}
                resizeMode="contain"
              />
            </View>
          )}
        />
      </View>

      {/* Bottom controls */}
      <View className="absolute bottom-0 left-0 right-0 pb-16">
        <View className="items-center gap-4">
          {/* Stepper indicator */}
          {headshotUrls.length > 1 && (
            <View className="flex-row gap-2">
              {headshotUrls.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </View>
          )}

          {/* Close button */}
          <Animated.View style={closeButtonStyle}>
            <TouchableOpacity
              onPress={onClose}
              className="h-12 w-12 items-center justify-center rounded-full bg-surface-default">
              <Icon name="arrow.up.to.line" size={24} className="text-icon-default" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  )
}
