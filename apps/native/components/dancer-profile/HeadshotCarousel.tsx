import React, { useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { Text } from '~/components/ui/text';
import { Icon } from '~/lib/icons/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeadshotCarouselProps {
  headshotUrls: Array<string>;
  initialIndex?: number;
  animatedIndex?: SharedValue<number>;
  onClose: () => void;
  onPress?: () => void;
}

export function HeadshotCarousel({
  headshotUrls,
  initialIndex = 0,
  animatedIndex,
  onClose,
  onPress,
}: HeadshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Derive the animated height value
  const animatedHeight = useDerivedValue(() => {
    if (!animatedIndex) {
      // return SCREEN_HEIGHT * 0.7;
      return SCREEN_HEIGHT * 0.85;
    }

    // Interpolate height: -1 (closed) = full screen, 0 (open) = 60%
    return interpolate(
      animatedIndex.value,
      [-1, 0],
      // [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.7],
      [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.85],
      Extrapolate.CLAMP
    );
  }, [animatedIndex]);

  // Container style uses the derived height
  const containerStyle = useAnimatedStyle(() => {
    return { height: animatedHeight.value };
  }, [animatedHeight]);

  const titleStyle = useAnimatedStyle(() => {
    if (!animatedIndex) return { opacity: 0 };

    // Fade in title when sheet closes (index goes from 0 to -1)
    const opacity = interpolate(animatedIndex.value, [-1, 0], [1, 0], Extrapolate.CLAMP);

    return { opacity };
  }, [animatedIndex]);

  const controlsStyle = useAnimatedStyle(() => {
    if (!animatedIndex) return { opacity: 0, transform: [{ translateY: 50 }] };

    // Fade in and slide up controls when sheet closes
    const opacity = interpolate(animatedIndex.value, [-1, 0], [1, 0], Extrapolate.CLAMP);

    const translateY = interpolate(animatedIndex.value, [-1, 0], [0, 50], Extrapolate.CLAMP);

    return { opacity, transform: [{ translateY }] };
  }, [animatedIndex]);

  if (headshotUrls.length === 0) return null;

  const content = (
    <Animated.View style={[{ width: SCREEN_WIDTH }, containerStyle]}>
      {/* Carousel */}
      <Carousel
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        data={headshotUrls}
        defaultIndex={initialIndex}
        onSnapToItem={setCurrentIndex}
        renderItem={({ item }) => {
          // Create animated style for each image
          const imageStyle = useAnimatedStyle(() => ({
            width: SCREEN_WIDTH,
            height: animatedHeight.value,
          }));

          return (
            <View style={{ flex: 1 }}>
              <Animated.Image source={{ uri: item }} style={imageStyle} resizeMode="cover" />
            </View>
          );
        }}
      />

      {/* Title - fades in when sheet closes */}
      <Animated.View
        style={[titleStyle]}
        className="absolute left-0 right-0 top-0 items-center"
        pointerEvents="none">
        <SafeAreaView className="pt-4">
          <Text variant="header5">Headshots</Text>
        </SafeAreaView>
      </Animated.View>

      {/* Bottom controls - slides up when sheet closes */}
      <SafeAreaView
        className="absolute bottom-0 left-0 right-0"
        edges={['bottom']}
        pointerEvents="box-none">
        <Animated.View
          style={[controlsStyle]}
          className="flex-row items-center px-4 pb-4"
          pointerEvents="box-none">
          {/* Close button */}
          <Button variant="secondary" size="icon" onPress={onClose}>
            <Icon name="arrow.up.to.line" size={24} className="text-icon-default" />
          </Button>

          {/* Stepper indicator */}
          <View className="flex-1 items-center">
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
          </View>

          {/* Spacer for symmetry */}
          <Button variant="secondary" size="icon" onPress={onClose}>
            <Icon name="arrowshape.turn.up.right.fill" size={24} className="text-icon-default" />
          </Button>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );

  // Wrap in TouchableOpacity for tap to expand (when sheet is open)
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress} style={{ flex: 1 }}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
