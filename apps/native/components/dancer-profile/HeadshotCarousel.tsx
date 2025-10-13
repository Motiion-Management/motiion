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

const SCREEN_HEIGHT_MODIFIER = 0.81;
const CONTAINED_HEIGHT = SCREEN_HEIGHT * SCREEN_HEIGHT_MODIFIER;
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
      return CONTAINED_HEIGHT;
    }

    // Interpolate height: 0 (minimized/letterboxed) = 70%, 1+ (expanded) = full screen
    return interpolate(
      animatedIndex.value,
      [0, 1],
      [CONTAINED_HEIGHT, SCREEN_HEIGHT],
      Extrapolate.CLAMP
    );
  }, [animatedIndex]);

  // Container style uses the derived height
  const containerStyle = useAnimatedStyle(() => {
    return { height: animatedHeight.value };
  }, [animatedHeight]);

  // Border radius animation: rounded-xl at index 0 → 0 at index 1+ (full screen)
  const borderRadiusStyle = useAnimatedStyle(() => {
    if (!animatedIndex) {
      return { borderRadius: 0, overflow: 'hidden' };
    }

    const borderRadius = interpolate(animatedIndex.value, [0, 1], [16, 0], Extrapolate.CLAMP);

    return { borderRadius, overflow: 'hidden' };
  }, [animatedIndex]);

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
        top: CONTAINED_HEIGHT + 16,
      };
    }

    // Fade out controls when sheet expands
    const opacity = interpolate(animatedIndex.value, [0, 1], [1, 0], Extrapolate.CLAMP);

    // Animate position to follow carousel bottom edge
    const top = interpolate(
      animatedIndex.value,
      [0, 1],
      [CONTAINED_HEIGHT + 16, SCREEN_HEIGHT],
      Extrapolate.CLAMP
    );

    return { opacity, top };
  }, [animatedIndex]);

  if (headshotUrls.length === 0) return null;

  const content = (
    <View style={{ flex: 1 }}>
      {/* Carousel with border radius */}
      <Animated.View
        style={[
          {
            // width: SCREEN_WIDTH,
            // marginHorizontal: 0,
            // position: 'absolute',
            // top: 0,
            // left: 0,
          },
          containerStyle,
          borderRadiusStyle,
        ]}>
        <Carousel
          width={SCREEN_WIDTH}
          // height={animatedHeight.value}
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
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
      </Animated.View>

      {/* Bottom controls - positioned in gap below carousel */}
      <Animated.View
        style={[
          controlsStyle,
          {
            position: 'absolute',
            left: 0,
            right: 0,
          },
        ]}
        pointerEvents="box-none">
        <View className="flex-row items-center justify-center px-4" pointerEvents="box-none">
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
                    className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/30'
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
