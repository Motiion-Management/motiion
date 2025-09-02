import React from 'react';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

type Props = {
  activeTabIndex: SharedValue<number>;
  tabWidths: SharedValue<number[]>;
  tabOffsets: SharedValue<number[]>;
  tabBarOffsetX: SharedValue<number>;
};

export function TabIndicator({ activeTabIndex, tabWidths, tabOffsets, tabBarOffsetX }: Props) {
  const rStyle = useAnimatedStyle(() => {
    const left = interpolate(
      activeTabIndex.value,
      Object.keys(tabOffsets.value).map(Number),
      tabOffsets.value
    );
    const width = interpolate(
      activeTabIndex.value,
      Object.keys(tabWidths.value).map(Number),
      tabWidths.value
    );
    return {
      left,
      width,
      transform: [{ translateX: -tabBarOffsetX.value }],
    };
  });

  return (
    <Animated.View
      className="absolute bottom-0 h-[2.5px] rounded-full bg-neutral-300"
      style={rStyle}
    />
  );
}
