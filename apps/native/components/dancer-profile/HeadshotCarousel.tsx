import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { Text } from '~/components/ui/text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeadshotCarouselProps {
  headshotUrls: Array<string>;
  initialIndex?: number;
  animatedIndex?: SharedValue<number>;
  onClose: () => void;
  onPress?: () => void;
}

const SCREEN_HEIGHT_MODIFIER = 0.75;
const IMAGE_HEIGHT = SCREEN_HEIGHT * SCREEN_HEIGHT_MODIFIER;
const COLLAPSED_WIDTH = SCREEN_WIDTH - 24;
const EXPANDED_WIDTH = SCREEN_WIDTH;
const COLLAPSED_SCALE_X = COLLAPSED_WIDTH / EXPANDED_WIDTH;
export function HeadshotCarousel({
  headshotUrls,
  initialIndex = 0,
  animatedIndex,
  onPress,
}: HeadshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const insets = useSafeAreaInsets();

  // Derive the animated height value
  const animatedHeight = useDerivedValue(() => {
    if (!animatedIndex) {
      return IMAGE_HEIGHT;
    }

    // Interpolate height: 0 (minimized/letterboxed) = 70%, 1+ (expanded) = full screen
    return interpolate(
      animatedIndex.value,
      [0, 1],
      [IMAGE_HEIGHT, SCREEN_HEIGHT],
      Extrapolate.CLAMP
    );
  }, [animatedIndex]);

  const animatedScaleX = useDerivedValue(() => {
    if (!animatedIndex) {
      return COLLAPSED_SCALE_X;
    }

    return interpolate(animatedIndex.value, [0, 1], [COLLAPSED_SCALE_X, 1], Extrapolate.CLAMP);
  }, [animatedIndex]);

  const containerStyle = useAnimatedStyle(() => {
    const index = animatedIndex?.value || 0;
    const height = animatedHeight.value;
    const top = interpolate(index, [0, 1], [insets.top + 48, 0], Extrapolate.CLAMP);

    return {
      top,
      height,
      width: SCREEN_WIDTH,
      position: 'absolute',
      left: 0,
      overflow: 'visible',
    };
  }, [animatedIndex, animatedHeight]);

  const titleStyle = useAnimatedStyle(() => {
    if (!animatedIndex) return { opacity: 0 };

    // Fade in title when sheet closes (index goes from 0 to -1)
    const opacity = interpolate(animatedIndex.value, [-1, 0], [1, 0], Extrapolate.CLAMP);

    return { opacity };
  }, [animatedIndex]);

  const controlsStyle = useAnimatedStyle(() => {
    if (!animatedIndex) {
      return {
        opacity: 1,
        top: IMAGE_HEIGHT + 24,
      };
    }

    // Fade out controls when sheet expands
    const opacity = interpolate(animatedIndex.value, [0, 1], [1, 0], Extrapolate.CLAMP);

    const IMAGE_BOTTOM = insets.top + 48 + IMAGE_HEIGHT;
    // Animate position to follow carousel bottom edge
    const top = interpolate(
      animatedIndex.value,
      [0, 1],
      [IMAGE_BOTTOM - 24, IMAGE_BOTTOM],
      Extrapolate.CLAMP
    );

    return { opacity, top };
  }, [animatedIndex]);

  if (headshotUrls.length === 0) return null;

  const content = (
    <View style={{ flex: 1 }}>
      {/* Carousel with border radius */}
      <Animated.View style={[containerStyle]}>
        <Carousel
          width={EXPANDED_WIDTH}
          data={headshotUrls}
          defaultIndex={initialIndex}
          onSnapToItem={setCurrentIndex}
          renderItem={({ item }) => {
            // Create animated style for each image
            const cardStyle = useAnimatedStyle(() => {
              const index = animatedIndex?.value || 0;
              const scaleX = animatedScaleX.value;
              const borderRadius = interpolate(index, [0, 1], [40, 0], Extrapolate.CLAMP);
              const translateX = (1 - scaleX) * SCREEN_WIDTH * 0.5;

              return {
                width: SCREEN_WIDTH,
                height: animatedHeight.value,
                borderRadius,
                overflow: 'hidden',
                transform: [{ translateX }, { scaleX }, { translateX: -translateX }],
              };
            });

            const imageStyle = useAnimatedStyle(() => ({
              width: SCREEN_WIDTH,
              height: animatedHeight.value,
            }));

            return (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View style={cardStyle}>
                  <Animated.Image source={{ uri: item }} style={imageStyle} resizeMode="cover" />
                </Animated.View>
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
      </Animated.View>

      {/* Stepper indicator - positioned below carousel */}
      <Animated.View
        style={[
          controlsStyle,
          {
            position: 'absolute',
            left: 0,
            right: 0,
          },
        ]}
        pointerEvents="none">
        <View className="items-center justify-center">
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
      </Animated.View>
    </View>
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
