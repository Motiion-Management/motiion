import React, { useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import {
  AnimatedScrollHeader,
  type AnimatedScrollHeaderConfig,
  type AnimatedScrollViewProps,
  type HeaderProps,
} from '~/components/ui/animated-scroll-header';
import { Button } from '~/components/ui/button';
import { Icon } from '~/lib/icons/Icon';

type HeaderSlot = HeaderProps['left'];

export interface TabScreenLayoutHeaderProps extends HeaderProps {
  showBackButton?: boolean;
  backIconName?: string;
  onBackPress?: () => void;
}

interface TabScreenLayoutProps extends Omit<AnimatedScrollViewProps, 'children'> {
  children: ReactNode;
  header?: TabScreenLayoutHeaderProps;
  headerConfig?: AnimatedScrollHeaderConfig;
}

export function TabScreenLayout({
  children,
  header,
  headerConfig,
  ...scrollViewProps
}: TabScreenLayoutProps) {
  const {
    left,
    middle,
    right,
    showBackButton = false,
    backIconName = 'chevron.left',
    onBackPress = () => router.back(),
  } = header ?? {};

  const leftSlot = useMemo<HeaderSlot | undefined>(() => {
    if (!showBackButton && !left) {
      return left;
    }

    return (slotProps) => {
      const customLeft = typeof left === 'function' ? left(slotProps) : left;
      const shouldRenderBack = showBackButton;

      if (!shouldRenderBack && !customLeft) {
        return null;
      }

      return (
        <View className="flex-row items-center gap-2">
          {shouldRenderBack ? (
            <Button variant="secondary" size="icon" onPress={onBackPress}>
              <Icon name={backIconName} className="text-icon-default" size={20} />
            </Button>
          ) : null}
          {customLeft}
        </View>
      );
    };
  }, [left, showBackButton, backIconName, onBackPress]);

  return (
    <AnimatedScrollHeader {...headerConfig}>
      <AnimatedScrollHeader.Header left={leftSlot} middle={middle} right={right} />
      <AnimatedScrollHeader.ScrollView {...scrollViewProps}>{children}</AnimatedScrollHeader.ScrollView>
    </AnimatedScrollHeader>
  );
}

export type { HeaderSlot as TabHeaderSlot };

function useTabScreenActionButtonShadow(scrollProgress: SharedValue<number>) {
  return useAnimatedStyle(() => {
    'worklet';
    const progress = scrollProgress.value;
    const shadowOpacity = interpolate(progress, [0, 1], [0.25, 0], Extrapolate.CLAMP);

    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity,
      shadowRadius: 7,
      elevation: shadowOpacity * 10,
    };
  });
}

interface TabScreenHeaderActionButtonProps {
  scrollProgress: SharedValue<number>;
  iconName: string;
  iconSize?: number;
  onPress?: () => void;
}

export function TabScreenHeaderActionButton({
  scrollProgress,
  iconName,
  iconSize = 24,
  onPress,
}: TabScreenHeaderActionButtonProps) {
  const buttonShadowStyle = useTabScreenActionButtonShadow(scrollProgress);

  return (
    <Animated.View style={buttonShadowStyle}>
      <Button variant="secondary" size="icon" onPress={onPress}>
        <Icon name={iconName} className="text-icon-default" size={iconSize} />
      </Button>
    </Animated.View>
  );
}
