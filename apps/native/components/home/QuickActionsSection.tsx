import React from 'react';
import { View } from 'react-native';

import { MediaCard } from '~/components/ui/media-card';

interface QuickActionsSectionProps {
  onSearchPress?: () => void;
  onManageContentPress?: () => void;
}

export function QuickActionsSection({
  onSearchPress,
  onManageContentPress,
}: QuickActionsSectionProps) {
  return (
    <View className="flex-row space-x-4">
      <MediaCard
        backgroundImage={require('./database-cover.png')}
        label="DATABASE"
        title="Search for Talent"
        backgroundColor="#6b73db"
        onPress={onSearchPress}
      />
      <MediaCard
        backgroundImage={require('./media-cover.png')}
        label="MEDIA"
        title="Manage Content"
        backgroundColor="#ff6b35"
        onPress={onManageContentPress}
      />
    </View>
  );
}
