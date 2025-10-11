import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from 'convex/react';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';

import { Text } from '~/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useUser } from '~/hooks/useUser';
import { api } from '@packages/backend/convex/_generated/api';
import Bell from '~/lib/icons/Bell';
import { Button } from '../ui/button';
import { MotiionLogo } from '~/lib/icons/MotiionLogo';
import type { HeaderSlot } from '~/components/ui/animated-scroll-header';

export function HomeHeaderLeft() {
  const { user } = useUser();
  const profile = useQuery(api.dancers.getMyDancerProfile, {});
  const headshotUrl = useQuery(api.dancers.getMyDancerHeadshotUrl, {});
  const dancerProfileId = user?.activeDancerId;

  const getInitials = () => {
    if (!user) return '?';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    const name = profile?.displayName || user.fullName;
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

  if (dancerProfileId) {
    return (
      <Link href={`/app/dancers/${dancerProfileId}`} asChild>
        <TouchableOpacity>
          <Avatar alt={profile?.displayName || user?.email || 'User avatar'} className="h-10 w-10">
            {headshotUrl && <AvatarImage source={{ uri: headshotUrl }} />}
            <AvatarFallback>
              <Text className="text-sm font-medium text-text-default">{getInitials()}</Text>
            </AvatarFallback>
          </Avatar>
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <Avatar alt={profile?.displayName || user?.email || 'User avatar'} className="h-10 w-10">
      {headshotUrl && <AvatarImage source={{ uri: headshotUrl }} />}
      <AvatarFallback>
        <Text className="text-sm font-medium text-text-default">{getInitials()}</Text>
      </AvatarFallback>
    </Avatar>
  );
}

export function HomeHeaderMiddle({ scrollProgress }: HeaderSlot) {
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
      {/* Text content */}
      <Animated.View style={[textStyle, { position: 'absolute' }]} className="items-center gap-1">
        <Text variant="labelXs" className="text-center text-text-low">
          {displayName}
        </Text>
        <Text variant="header5" className="text-center">
          {profileTypeLabel}
        </Text>
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[logoStyle, { position: 'absolute' }]}>
        <MotiionLogo />
      </Animated.View>
    </View>
  );
}

export function HomeHeaderRight({ scrollProgress }: HeaderSlot) {
  const buttonShadowStyle = useAnimatedStyle(() => {
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

  return (
    <Link href="/app/notifications" asChild>
      <Animated.View style={buttonShadowStyle}>
        <Button variant="secondary" size="icon">
          <Bell className="h-6 w-6 text-white" />
        </Button>
      </Animated.View>
    </Link>
  );
}
