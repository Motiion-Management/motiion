import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Text } from '~/components/ui/text';
import { useUser } from '~/hooks/useUser';
import Settings from '~/lib/icons/Settings';
import Bell from '~/lib/icons/Bell';
import { UserButton } from '../auth/UserButton';

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
    <View className="flex-row items-start justify-between px-4 pb-0">
      {/* Profile info */}
      <View className="flex-1 gap-1">
        <Text variant="bodySm">{profileTypeLabel}</Text>
        <Text variant="header4">{displayName}</Text>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center gap-4">
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

        <UserButton />
      </View>
    </View>
  );
}
