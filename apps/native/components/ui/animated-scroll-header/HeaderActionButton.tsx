import { router } from 'expo-router';
import React from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { Button } from '~/components/ui/button';
import { Icon, IconProps } from '~/lib/icons/Icon';

function useHeaderActionButtonShadow(scrollProgress: SharedValue<number>) {
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

interface HeaderActionButtonProps {
  scrollProgress: SharedValue<number>;
  iconName: IconProps['name'];
  iconSize?: number;
  onPress?: () => void;
}

export function HeaderActionButton({
  scrollProgress,
  iconName,
  iconSize = 24,
  onPress,
}: HeaderActionButtonProps) {
  const buttonShadowStyle = useHeaderActionButtonShadow(scrollProgress);

  return (
    <Animated.View style={buttonShadowStyle}>
      <Button variant="secondary" size="icon" onPress={onPress}>
        <Icon name={iconName} className="text-icon-default" size={iconSize} />
      </Button>
    </Animated.View>
  );
}

export function HeaderBackButton({
  scrollProgress,
}: Omit<HeaderActionButtonProps, 'iconName' | 'iconSize' | 'onPress'>) {
  const buttonShadowStyle = useHeaderActionButtonShadow(scrollProgress);

  function onPress() {
    router.back();
  }
  return (
    <Animated.View style={buttonShadowStyle}>
      <Button variant="secondary" size="icon" onPress={onPress}>
        <Icon name="chevron.left" className="text-icon-default" size={20} />
      </Button>
    </Animated.View>
  );
}
