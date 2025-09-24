import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { HomeHeader } from '~/components/home';
import { Text } from '~/components/ui/text';

export default function HomeScreen() {
  const handleSettingsPress = () => {
    // TODO: Navigate to settings
    console.log('Settings pressed');
  };

  const handleNotificationsPress = () => {
    // TODO: Navigate to notifications
    console.log('Notifications pressed');
  };

  const handleProfilePress = () => {
    // TODO: Navigate to profile
    console.log('Profile pressed');
  };

  return (
    <BackgroundGradientView>
      <SafeAreaView className="flex-1">
        {/* Header */}
        <HomeHeader
          onSettingsPress={handleSettingsPress}
          onNotificationsPress={handleNotificationsPress}
          onProfilePress={handleProfilePress}
        />

        {/* Scrollable content */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
          {/* Recently Added Section */}
          <Text>Activity Screen</Text>
        </ScrollView>
      </SafeAreaView>
    </BackgroundGradientView>
  );
}
