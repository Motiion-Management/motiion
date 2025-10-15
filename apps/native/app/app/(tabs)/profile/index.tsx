import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import {
  ProfileHeaderSettingsButton,
  ProfileHeaderTitle,
} from '~/components/profile/ProfileHeader';
import { Text } from '~/components/ui/text';

export default function ProfileScreen() {
  const { bottom } = useSafeAreaInsets();

  return (
    <TabScreenLayout
      header={{
        left: <View className="size-10" />,
        middle: (slot) => <ProfileHeaderTitle {...slot} />,
        right: (slot) => <ProfileHeaderSettingsButton {...slot} />,
      }}
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: bottom + 120,
      }}
      showsVerticalScrollIndicator={false}>
      <View className="gap-8">
        <Text>Profile Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
