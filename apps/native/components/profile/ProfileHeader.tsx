import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { Text } from '~/components/ui/text';
import { MotiionLogo } from '~/lib/icons/MotiionLogo';
import { useUser } from '~/hooks/useUser';
import { api } from '@packages/backend/convex/_generated/api';
import { TabScreenHeaderActionButton } from '~/components/layouts/TabScreenLayout';

interface AnimatedSlotProps {
  scrollProgress: SharedValue<number>;
}

export function ProfileHeaderTitle({ scrollProgress }: AnimatedSlotProps) {
  const { user } = useUser();
  const profile = useQuery(api.dancers.getMyDancerProfile, {});

  const profileType = user?.activeProfileType || 'dancer';
  const displayName = profile?.displayName || user?.fullName || 'User';
  const profileTypeLabel = profileType.charAt(0).toUpperCase() + profileType.slice(1);

  const textStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = scrollProgress.value;
    const opacity = interpolate(progress, [0, 0.4], [1, 0], Extrapolate.CLAMP);

    return { opacity };
  });

  const logoStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = scrollProgress.value;
    const opacity = interpolate(progress, [0.6, 1], [0, 1], Extrapolate.CLAMP);

    return { opacity };
  });

  return (
    <View className="h-[22px] w-[69px] items-center justify-center">
      <Animated.View style={[textStyle, { position: 'absolute' }]} className="items-center gap-1">
        <Text variant="labelXs" className="text-center text-text-low">
          {displayName}
        </Text>
        <Text variant="header5" className="text-center">
          {profileTypeLabel}
        </Text>
      </Animated.View>

      <Animated.View style={[logoStyle, { position: 'absolute' }]}>
        <MotiionLogo />
      </Animated.View>
    </View>
  );
}

export function ProfileHeaderSettingsButton({ scrollProgress }: AnimatedSlotProps) {
  return (
    <TabScreenHeaderActionButton
      scrollProgress={scrollProgress}
      iconName="gear"
      onPress={() => router.push('/app/(tabs)/profile/settings')}
    />
  );
}
