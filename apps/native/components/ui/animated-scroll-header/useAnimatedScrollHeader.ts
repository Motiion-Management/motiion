import { useSharedValue, useAnimatedScrollHandler, useDerivedValue } from 'react-native-reanimated';
import type { AnimatedScrollHeaderConfig, AnimatedScrollHeaderContextValue } from './types';

const DEFAULT_CONFIG: Required<AnimatedScrollHeaderConfig> = {
  threshold: 32,
  headerHeight: 90,
  headerHeightCollapsed: 60,
};

export function useAnimatedScrollHeader(
  userConfig?: AnimatedScrollHeaderConfig
): AnimatedScrollHeaderContextValue {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const scrollProgress = useDerivedValue(() => {
    return Math.min(Math.max(scrollY.value / config.threshold, 0), 1);
  });

  return {
    scrollProgress,
    scrollHandler,
    config,
  };
}
