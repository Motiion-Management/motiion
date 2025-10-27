import React, { type ComponentType, type ReactNode } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { HeaderActionButton } from '~/components/ui/animated-scroll-header/HeaderActionButton';
import { HeaderTitle } from '~/components/ui/animated-scroll-header/HeaderTitle';
import { type IconProps } from '~/lib/icons/Icon';

// Create animated ScrollView component
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Constants - standardized across all tab screens
const HEADER_HEIGHT = 90;
const HEADER_HEIGHT_COLLAPSED = 60;
const SCROLL_THRESHOLD = 32;
const SIDE_SLOT_MIN_WIDTH = 40;
const SLOT_PLACEHOLDER_SIZE = 40;

// Header slot type
export interface HeaderSlot {
  scrollProgress: SharedValue<number>;
}

type HeaderSlotComponent = ComponentType<HeaderSlot>;
type LeftHeaderSlot = HeaderSlotComponent | 'back' | Array<'back' | HeaderSlotComponent>;
type MiddleHeaderSlot = HeaderSlotComponent | string;
type RightHeaderSlot = HeaderSlotComponent;

// Header props
export interface TabScreenLayoutHeaderProps {
  left?: LeftHeaderSlot;
  middle?: MiddleHeaderSlot;
  right?: RightHeaderSlot;
  backIconName?: IconProps['name'];
  onBackPress?: () => void;
}

// Layout props - minimal API surface
interface TabScreenLayoutProps {
  children: ReactNode;
  header?: TabScreenLayoutHeaderProps;
  headerCollapsed?: boolean;
}

export function TabScreenLayout({
  children,
  header,
  headerCollapsed = false,
}: TabScreenLayoutProps) {
  const { top: safeAreaTop, bottom: safeAreaBottom } = useSafeAreaInsets();

  // Extract header props
  const {
    left,
    middle,
    right,
    backIconName = 'chevron.left',
    onBackPress = () => router.back(),
  } = header ?? {};

  // Header collapse progress (0 = expanded, 1 = collapsed)
  const collapseProgress = useSharedValue(0);

  // Update collapse progress when prop changes
  React.useEffect(() => {
    collapseProgress.value = withTiming(headerCollapsed ? 1 : 0, { duration: 300 });
  }, [headerCollapsed]);

  const scrollProgress = useDerivedValue(() => {
    return collapseProgress.value;
  });

  const renderSlotComponent = (SlotComponent?: HeaderSlotComponent) => {
    if (!SlotComponent) {
      return null;
    }

    const Component = SlotComponent;
    return <Component scrollProgress={scrollProgress} />;
  };

  const normalizeLeftSlot = (value: LeftHeaderSlot | undefined) => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    return [value];
  };

  const leftItems = normalizeLeftSlot(left).map((item, index) => {
    if (item === 'back') {
      return (
        <HeaderActionButton
          key={`left-back-${index}`}
          scrollProgress={scrollProgress}
          iconName={backIconName}
          iconSize={20}
          onPress={onBackPress}
        />
      );
    }

    const SlotComponent = item;
    return <SlotComponent key={`left-component-${index}`} scrollProgress={scrollProgress} />;
  });

  const middleContent =
    typeof middle === 'string' ? <HeaderTitle title={middle} /> : renderSlotComponent(middle);

  const rightContent = renderSlotComponent(right);

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
            <View className="flex-row items-center gap-2" style={{ minWidth: SIDE_SLOT_MIN_WIDTH }}>
              {leftItems.length > 0 ? (
                leftItems
              ) : (
                <View style={{ width: SLOT_PLACEHOLDER_SIZE, height: SLOT_PLACEHOLDER_SIZE }} />
              )}
            </View>

            {/* Middle slot */}
            <View className="flex-1 items-center justify-center px-2">
              {middleContent ?? <View style={{ height: SLOT_PLACEHOLDER_SIZE }} />}
            </View>

            {/* Right slot */}
            <View
              className="flex-row items-center justify-end gap-2"
              style={{ minWidth: SIDE_SLOT_MIN_WIDTH }}>
              {rightContent ?? (
                <View style={{ width: SLOT_PLACEHOLDER_SIZE, height: SLOT_PLACEHOLDER_SIZE }} />
              )}
            </View>
          </View>
        </Animated.View>

        {/* Scrollable Content */}
        <AnimatedScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT + safeAreaTop,
            paddingBottom: safeAreaBottom,
          }}>
          {children}
        </AnimatedScrollView>
      </View>
    </BackgroundGradientView>
  );
}

// Export types for external use
export type { HeaderSlot as TabHeaderSlot };
