import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useAnimatedScrollHeaderContext } from './context';
import type { HeaderProps } from './types';

export function Header({ left, middle, right }: HeaderProps) {
  const { scrollProgress, config } = useAnimatedScrollHeaderContext();
  const { top: safeAreaTop } = useSafeAreaInsets();

  const { headerHeight, headerHeightCollapsed } = config;

  // Render slot content (supports both static and function slots)
  const renderSlot = (slot: HeaderProps['left' | 'middle' | 'right']) => {
    if (typeof slot === 'function') {
      return slot({ scrollProgress });
    }
    return slot;
  };

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = scrollProgress.value;
    const height = interpolate(
      progress,
      [0, 1],
      [headerHeight + safeAreaTop, headerHeightCollapsed + safeAreaTop],
      Extrapolate.CLAMP
    );

    return { height };
  });

  const blurStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = scrollProgress.value;
    const opacity = interpolate(progress, [0, 1], [0, 0.95], Extrapolate.CLAMP);

    return { opacity };
  });

  const borderStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = scrollProgress.value;
    const opacity = interpolate(progress, [0, 1], [0, 1], Extrapolate.CLAMP);

    return {
      borderBottomWidth: 1,
      borderBottomColor: `rgba(55, 59, 65, ${opacity * 0.4})`,
    };
  });

  return (
    <Animated.View
      style={[
        containerStyle,
        borderStyle,
        { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
      ]}>
      {/* Blur background layer */}
      <Animated.View
        pointerEvents="none"
        className="bg-background-nav"
        style={[blurStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
        <BlurView intensity={20} className="flex-1" />
      </Animated.View>

      {/* Safe area spacer */}
      <View style={{ height: safeAreaTop - 5 }} />

      {/* Content - centered in remaining space */}
      <View className="flex-1 flex-row items-center justify-between px-4">
        {/* Left slot */}
        {left && <View className="flex-row items-center">{renderSlot(left)}</View>}

        {/* Middle slot */}
        {middle && (
          <View className="flex-row items-center justify-center">{renderSlot(middle)}</View>
        )}

        {/* Right slot */}
        {right && <View className="flex-row items-center">{renderSlot(right)}</View>}
      </View>
    </Animated.View>
  );
}
