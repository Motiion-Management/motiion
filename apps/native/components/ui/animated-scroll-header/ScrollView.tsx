import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useAnimatedScrollHeaderContext } from './AnimatedScrollHeader';
import type { AnimatedScrollViewProps } from './types';

export function ScrollView({ children, ...scrollViewProps }: AnimatedScrollViewProps) {
  const { scrollHandler, config } = useAnimatedScrollHeaderContext();
  const { top: safeAreaTop } = useSafeAreaInsets();

  const { headerHeight } = config;

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}>
      <View style={{ paddingTop: headerHeight + safeAreaTop }}>{children}</View>
    </Animated.ScrollView>
  );
}
