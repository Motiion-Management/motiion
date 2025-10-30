import React from 'react';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { type ProfileSheetBackgroundProps } from './types';

export function ProfileSheetBackground({
  animatedIndex,
  screenHeight,
  headerHeight,
}: ProfileSheetBackgroundProps) {
  const backgroundStyle = useAnimatedStyle(() => {
    // Horizontal margins: 8px at index 0 (30%) → 0px at index 1 (70%)
    const marginHorizontal = interpolate(animatedIndex.value, [0, 1], [8, 0], Extrapolate.CLAMP);

    // Height: dynamic based on header content at 30% → full height at 70%
    const height = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight, screenHeight],
      Extrapolate.CLAMP
    );

    // Border radius: pill shape at collapsed → rounded corners at expanded
    const borderTopRadius = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight / 2, 34],
      Extrapolate.CLAMP
    );
    const borderBottomRadius = headerHeight / 2;

    // Shadow opacity: visible at index 0, fades out at index 1
    const shadowOpacity = interpolate(animatedIndex.value, [0, 1], [0.15, 0], Extrapolate.CLAMP);

    return {
      marginTop: 0,
      marginHorizontal,
      height,
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
      borderBottomLeftRadius: borderBottomRadius,
      borderBottomRightRadius: borderBottomRadius,
      shadowOpacity,
    };
  });

  return (
    <Animated.View
      className="absolute left-0 right-0 top-0 overflow-hidden bg-surface-overlay"
      style={[
        backgroundStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 5,
        },
      ]}>
      <BlurView intensity={35} className="flex-1" />
    </Animated.View>
  );
}
