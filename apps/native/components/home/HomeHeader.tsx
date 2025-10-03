import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

import { Text } from '~/components/ui/text';
import { useUser } from '~/hooks/useUser';
import Bell from '~/lib/icons/Bell';
import { UserButton } from '../auth/UserButton';

interface HomeHeaderProps {
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export function HomeHeader({ onNotificationsPress }: HomeHeaderProps) {
  const { user } = useUser();

  const profileType = user?.profileType || 'dancer';
  const displayName = user?.displayName || user?.fullName || 'User';

  const profileTypeLabel = profileType.charAt(0).toUpperCase() + profileType.slice(1);
  const dancerProfileId = user?.activeDancerId;

  return (
    <View className="flex-row items-start justify-between px-4 pb-0">
      <View className="flex-row items-center gap-4">
        {/* Profile info - Link to dancer profile */}
        {dancerProfileId ? (
          <Link href={`/app/dancers/${dancerProfileId}`} asChild>
            <TouchableOpacity>
              <UserButton />
            </TouchableOpacity>
          </Link>
        ) : (
          <UserButton />
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
