import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Text } from '~/components/ui/text';
import { Avatar } from '~/components/ui/avatar';
import { useUser } from '~/hooks/useUser';
import Settings from '~/lib/icons/Settings';
import Bell from '~/lib/icons/Bell';

interface HomeHeaderProps {
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export function HomeHeader({
  onSettingsPress,
  onNotificationsPress,
  onProfilePress,
}: HomeHeaderProps) {
  const { user } = useUser();

  const profileType = user?.profileType || 'dancer';
  const displayName = user?.displayName || user?.fullName || 'User';

  const profileTypeLabel = profileType.charAt(0).toUpperCase() + profileType.slice(1);

  return (
    <View className="flex-row items-start justify-between px-4 pb-0 pt-16">
      {/* Profile info */}
      <View className="flex-1">
        <Text className="mb-0.5 text-sm font-normal text-text-high">{profileTypeLabel}</Text>
        <Text className="text-lg font-semibold text-text-high">{displayName}</Text>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center space-x-1">
        {/* Settings */}
        <TouchableOpacity
          onPress={onSettingsPress}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-tint shadow-sm">
          <Settings className="h-6 w-6 color-white" />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          onPress={onNotificationsPress}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-tint shadow-sm">
          <Bell className="h-6 w-6 color-white" />
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity onPress={onProfilePress} className="ml-1">
          <Avatar
            alt={`${displayName} profile`}
            className="h-10 w-10 border border-border-tint shadow-sm">
            <Text className="text-sm font-medium text-white">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </Avatar>
        </TouchableOpacity>
      </View>
    </View>
  );
}
