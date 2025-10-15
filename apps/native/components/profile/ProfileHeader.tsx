import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Animated, { type SharedValue } from 'react-native-reanimated';

import { Text } from '~/components/ui/text';
import { HeaderActionButton } from '~/components/ui/animated-scroll-header';

interface AnimatedSlotProps {
  scrollProgress: SharedValue<number>;
}

export function ProfileHeaderTitle({ scrollProgress }: AnimatedSlotProps) {
  return (
    <View className="items-center justify-center">
      <Text variant="header5">Profile</Text>
    </View>
  );
}

export function ProfileHeaderSettingsButton({ scrollProgress }: AnimatedSlotProps) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="gear"
      onPress={() => router.push('/app/(tabs)/profile/settings')}
    />
  );
}
