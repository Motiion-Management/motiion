import React, { useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  type SharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Button } from '~/components/ui/button';
import { Icon, type IconProps } from '~/lib/icons/Icon';

// Constants - standardized across all tab screens
const HEADER_HEIGHT = 90;
const HEADER_HEIGHT_COLLAPSED = 60;
const SCROLL_THRESHOLD = 32;

// Header slot type
export interface HeaderSlot {
  scrollProgress: SharedValue<number>;
}

// Header props
export interface TabScreenLayoutHeaderProps {
  left?: ReactNode | ((slot: HeaderSlot) => ReactNode);
  middle?: ReactNode | ((slot: HeaderSlot) => ReactNode);
  right?: ReactNode | ((slot: HeaderSlot) => ReactNode);
  showBackButton?: boolean;
  backIconName?: IconProps['name'];
  onBackPress?: () => void;
}

// Layout props - minimal API surface
interface TabScreenLayoutProps {
  children: ReactNode;
  header?: TabScreenLayoutHeaderProps;
}

export function TabScreenLayout({ children, header }: TabScreenLayoutProps) {
  const { top: safeAreaTop, bottom: safeAreaBottom } = useSafeAreaInsets();

  // Extract header props
  const {
    left,
    middle,
    right,
    showBackButton = false,
    backIconName = 'chevron.left',
    onBackPress = () => router.back(),
  } = header ?? {};

  // Scroll animation logic
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const scrollProgress = useDerivedValue(() => {
    return Math.min(Math.max(scrollY.value / SCROLL_THRESHOLD, 0), 1);
  });

  // Render slot content (supports both static and function slots)
  const renderSlot = (slot: TabScreenLayoutHeaderProps['left' | 'middle' | 'right']) => {
    if (typeof slot === 'function') {
      return slot({ scrollProgress });
    }
    return slot;
  };

  // Left slot with optional back button
  const leftSlot = useMemo(() => {
    if (!showBackButton && !left) {
      return null;
    }

    const customLeft = typeof left === 'function' ? left({ scrollProgress }) : left;

    if (!showBackButton && !customLeft) {
      return null;
    }

    return (
      <View className="flex-row items-center gap-2">
        {showBackButton ? (
          <Button variant="secondary" size="icon" onPress={onBackPress}>
            <Icon name={backIconName} className="text-icon-default" size={20} />
          </Button>
        ) : null}
        {customLeft}
      </View>
    );
  }, [left, showBackButton, backIconName, onBackPress, scrollProgress]);

  // Animated styles for header
  const headerContainerStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = scrollProgress.value;
    const height = interpolate(
      progress,
      [0, 1],
      [HEADER_HEIGHT + safeAreaTop, HEADER_HEIGHT_COLLAPSED + safeAreaTop],
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
    <BackgroundGradientView>
      <View className="flex-1">
        {/* Animated Header - Absolutely Positioned */}
        <Animated.View
          style={[
            headerContainerStyle,
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
          <View style={{ height: safeAreaTop }} />

          {/* Header content - centered in remaining space */}
          <View className="flex-1 flex-row items-center justify-between px-4">
            {/* Left slot */}
            {leftSlot && <View className="flex-row items-center">{leftSlot}</View>}

            {/* Middle slot */}
            {middle && (
              <View className="flex-row items-center justify-center">{renderSlot(middle)}</View>
            )}

            {/* Right slot */}
            {right && <View className="flex-row items-center">{renderSlot(right)}</View>}
          </View>
        </Animated.View>

        {/* Scrollable Content */}
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT + safeAreaTop,
            paddingBottom: safeAreaBottom + 120,
          }}>
          {children}
        </Animated.ScrollView>
      </View>
    </BackgroundGradientView>
  );
}

// Export types for external use
export type { HeaderSlot as TabHeaderSlot };
