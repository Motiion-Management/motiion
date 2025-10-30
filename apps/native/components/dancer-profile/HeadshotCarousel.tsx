import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity, type ImageStyle } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Transition from 'react-native-screen-transitions';
import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

interface HeadshotCarouselProps {
  headshotUrls: Array<string>;
  initialIndex?: number;
  animatedIndex?: SharedValue<number>;
  onClose: () => void;
  onPress?: () => void;
  onIndexChange?: (index: number) => void;
}

const SCREEN_HEIGHT_MODIFIER = 0.865;
const IMAGE_HEIGHT = SCREEN_HEIGHT * SCREEN_HEIGHT_MODIFIER;
const COLLAPSED_WIDTH = SCREEN_WIDTH - 12;
const EXPANDED_WIDTH = SCREEN_WIDTH;

// Memoized render item component for performance
const HeadshotItem = React.memo<{
  item: string;
  index: number;
  isFirst: boolean;
  animatedIndex: SharedValue<number> | undefined;
  animatedWidth: SharedValue<number>;
  animatedHeight: SharedValue<number>;
  onPress?: () => void;
}>(({ item, index, isFirst, animatedIndex, animatedWidth, animatedHeight, onPress }) => {
  const imageStyle = useAnimatedStyle<ImageStyle>(() => ({
    width: animatedWidth.value,
    height: animatedHeight.value,
    borderTopLeftRadius: interpolate(animatedIndex?.value || 0, [0, 1], [25, 0], Extrapolate.CLAMP),
    borderTopRightRadius: interpolate(animatedIndex?.value || 0, [0, 1], [25, 0], Extrapolate.CLAMP),
    borderBottomLeftRadius: interpolate(animatedIndex?.value || 0, [0, 1], [50, 0], Extrapolate.CLAMP),
    borderBottomRightRadius: interpolate(animatedIndex?.value || 0, [0, 1], [50, 0], Extrapolate.CLAMP),
  }));

  const firstImageWrapperStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
    height: animatedHeight.value,
  }));

  if (isFirst) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={firstImageWrapperStyle}>
          <Transition.Pressable
            sharedBoundTag="dancer-avatar"
            onPress={onPress || (() => {})}
            collapsable={false}
            style={{
              width: '100%',
              height: '100%',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              overflow: 'hidden',
            }}>
            <ExpoImage
              source={{ uri: item }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
              priority="high"
              placeholderContentFit="cover"
            />
          </Transition.Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <AnimatedExpoImage
        source={{ uri: item }}
        style={imageStyle}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
        priority={index < 3 ? 'high' : 'normal'}
        placeholderContentFit="cover"
      />
    </View>
  );
});

HeadshotItem.displayName = 'HeadshotItem';

export function HeadshotCarousel({
  headshotUrls,
  initialIndex = 0,
  animatedIndex,
  onPress,
  onIndexChange,
}: HeadshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const insets = useSafeAreaInsets();

  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    onIndexChange?.(index);
  };

  // Derive the animated height value
  const animatedHeight = useDerivedValue<number>(() => {
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

  const animatedWidth = useDerivedValue<number>(() => {
    if (!animatedIndex) {
      return COLLAPSED_WIDTH;
    }

    return interpolate(
      animatedIndex.value,
      [0, 1],
      [COLLAPSED_WIDTH, EXPANDED_WIDTH],
      Extrapolate.CLAMP
    );
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

  const controlsStyle = useAnimatedStyle(() => {
    if (!animatedIndex) {
      return {
        opacity: 1,
        top: IMAGE_HEIGHT + 24,
      };
    }

    // Fade out controls when sheet expands
    const opacity = interpolate(animatedIndex.value, [0, 1], [1, 0], Extrapolate.CLAMP);

    const IMAGE_BOTTOM = insets.top + IMAGE_HEIGHT;
    // Animate position to follow carousel bottom edge
    const top = interpolate(
      animatedIndex.value,
      [0, 1],
      [IMAGE_BOTTOM - 100, IMAGE_BOTTOM],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      top,
    };
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
          onSnapToItem={handleIndexChange}
          renderItem={({ item, index }) => (
            <HeadshotItem
              key={`${item}-${index}`}
              item={item}
              index={index}
              isFirst={index === 0}
              animatedIndex={animatedIndex}
              animatedWidth={animatedWidth}
              animatedHeight={animatedHeight}
              onPress={onPress}
            />
          )}
        />
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
