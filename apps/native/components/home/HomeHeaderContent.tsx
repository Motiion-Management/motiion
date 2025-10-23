import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Link, router } from 'expo-router';
import { useQuery } from 'convex/react';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import Transition from 'react-native-screen-transitions';
import { Image as ExpoImage } from 'expo-image';

import { Text } from '~/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useUser } from '~/hooks/useUser';
import { api } from '@packages/backend/convex/_generated/api';
import Bell from '~/lib/icons/Bell';
import { Button } from '../ui/button';
import { MotiionLogo } from '~/lib/icons/MotiionLogo';
import type { TabHeaderSlot } from '~/components/layouts/TabScreenLayout';

export function HomeHeaderLeft(_: TabHeaderSlot) {
  const { user } = useUser();
  const profile = useQuery(api.dancers.getMyDancerProfile, {});
  const headshotUrl = useQuery(api.dancers.getMyDancerHeadshotUrl, {});
  const dancerProfileId = user?.activeDancerId;

  useEffect(() => {
    if (headshotUrl) {
      ExpoImage.prefetch(headshotUrl).catch(() => {
        // Ignore cache failures; runtime loading will still work.
      });
    }
  }, [headshotUrl]);

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
    const handleAvatarPress = () => {
      router.push({
        pathname: '/app/dancers/[id]',
        params: {
          id: dancerProfileId,
          ...(headshotUrl ? { headshot: headshotUrl } : {}),
        },
      });
    };

    if (headshotUrl) {
      return (
        <View className="rounded-full border border-border-tint" style={{ width: 40, height: 40 }}>
          <Transition.Pressable
            sharedBoundTag="dancer-avatar"
            onPress={handleAvatarPress}
            collapsable={false}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              overflow: 'hidden',
            }}>
            <ExpoImage
              source={{ uri: headshotUrl }}
              style={{ width: 40, height: 40 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
            />
          </Transition.Pressable>
        </View>
      );
    }

    return (
      <Avatar alt={profile?.displayName || user?.email || 'User avatar'} className="h-10 w-10">
        <AvatarFallback>
          <Text className="text-sm font-medium text-text-default">{getInitials()}</Text>
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar alt={profile?.displayName || user?.email || 'User avatar'} className="h-10 w-10">
      {headshotUrl && (
        <AvatarImage
          source={{ uri: headshotUrl }}
          asChild>
          <ExpoImage
            source={{ uri: headshotUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={0}
          />
        </AvatarImage>
      )}
      <AvatarFallback>
        <Text className="text-sm font-medium text-text-default">{getInitials()}</Text>
      </AvatarFallback>
    </Avatar>
  );
}

export function HomeHeaderMiddle({ scrollProgress }: TabHeaderSlot) {
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

export function HomeHeaderRight({ scrollProgress }: TabHeaderSlot) {
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
    <Animated.View style={buttonShadowStyle}>
      <Link href="/app/notifications" asChild>
        <Button variant="secondary" size="icon">
          <Bell className="h-6 w-6 text-white" />
        </Button>
      </Link>
    </Animated.View>
  );
}
