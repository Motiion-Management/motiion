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
    const marginTop = interpolate(animatedIndex.value, [0, 1], [6, 0], Extrapolate.CLAMP);

    // Height: dynamic based on header content at 30% → full height at 70%
    const height = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight, screenHeight],
      Extrapolate.CLAMP
    );

    // Top border radius: half of header height (fully rounds pill) → rounded-3xl (34px for larger sheet)
    const borderTopRadius = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight / 2, 34],
      Extrapolate.CLAMP
    );

    // Bottom border radius: half of header height (matches top for consistent pill shape)
    const borderBottomRadius = headerHeight / 2;

    // Shadow opacity: visible at index 0, fades out at index 1
    const shadowOpacity = interpolate(animatedIndex.value, [0, 1], [0.15, 0], Extrapolate.CLAMP);

    return {
      marginTop,
      marginHorizontal,
      height,
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
      borderBottomLeftRadius: borderBottomRadius,
      borderBottomRightRadius: borderBottomRadius,
      shadowOpacity,
    };
  });

  // Extract border radius values for BlurView
  const blurViewStyle = useAnimatedStyle(() => {
    const borderTopRadius = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight / 2, 34],
      Extrapolate.CLAMP
    );
    const borderBottomRadius = headerHeight / 2;

    return {
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
      borderBottomLeftRadius: borderBottomRadius,
      borderBottomRightRadius: borderBottomRadius,
    };
  });

  return (
    <Animated.View
      style={[
        backgroundStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 5,
          overflow: 'hidden',
        },
      ]}>
      <Animated.View style={[blurViewStyle, { flex: 1 }]} className="bg-surface-overlay">
        <BlurView intensity={35} style={{ flex: 1 }} />
      </Animated.View>
    </Animated.View>
  );
}
