import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from 'convex/react';

import { Text } from '~/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useUser } from '~/hooks/useUser';
import { api } from '@packages/backend/convex/_generated/api';
import Bell from '~/lib/icons/Bell';

interface HomeHeaderProps {
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export function HomeHeader({ onNotificationsPress }: HomeHeaderProps) {
  const { user } = useUser();
  const profile = useQuery(api.dancers.getMyDancerProfile, {});
  const headshotUrl = useQuery(api.dancers.getMyDancerHeadshotUrl, {});

  const profileType = user?.activeProfileType || 'dancer';
  const displayName = profile?.displayName || user?.fullName || 'User';

  const profileTypeLabel = profileType.charAt(0).toUpperCase() + profileType.slice(1);
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

  return (
    <View className="flex-row items-start justify-between px-4 pb-0">
      <View className="flex-row items-center gap-4">
        {/* Profile Avatar - Link to dancer profile */}
        {dancerProfileId ? (
          <Link href={`/app/dancers/${dancerProfileId}`} prefetch asChild>
            <Link.Preview />
            <Link.Trigger>
              <TouchableOpacity>
                <Avatar
                  alt={profile?.displayName || user?.email || 'User avatar'}
                  className="h-10 w-10">
                  {headshotUrl && <AvatarImage source={{ uri: headshotUrl }} />}
                  <AvatarFallback>
                    <Text className="text-sm font-medium text-text-default">{getInitials()}</Text>
                  </AvatarFallback>
                </Avatar>
              </TouchableOpacity>
            </Link.Trigger>
          </Link>
        ) : (
          <Avatar alt={profile?.displayName || user?.email || 'User avatar'} className="h-10 w-10">
            {headshotUrl && <AvatarImage source={{ uri: headshotUrl }} />}
            <AvatarFallback>
              <Text className="text-sm font-medium text-text-default">{getInitials()}</Text>
            </AvatarFallback>
          </Avatar>
        )}

        {/* Account Switcher */}
        <View className="flex-1 gap-1">
          <Text variant="labelXs" className="text-center text-text-low">
            {displayName}
          </Text>
          <Text variant="header5" className="text-center">
            {profileTypeLabel}
          </Text>
        </View>
        {/* Notifications */}
        <Link href="/app/notifications" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-surface-tint shadow-sm">
            <Bell className="h-6 w-6 text-white" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
