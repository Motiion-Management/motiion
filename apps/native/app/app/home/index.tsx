import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import {
  HomeHeader,
  RecentlyAddedSection,
  BookedOutDatesSection,
  QuickActionsSection,
} from '~/components/home';

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

  const handleAddExperiencePress = () => {
    // TODO: Navigate to add experience
    console.log('Add experience pressed');
  };

  const handleEditAvailabilityPress = () => {
    // TODO: Navigate to edit availability
    console.log('Edit availability pressed');
  };

  const handleSearchTalentPress = () => {
    // TODO: Navigate to talent search
    console.log('Search talent pressed');
  };

  const handleManageContentPress = () => {
    // TODO: Navigate to content management
    console.log('Manage content pressed');
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
          <View className="mb-6">
            <RecentlyAddedSection onAddPress={handleAddExperiencePress} />
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <QuickActionsSection
              onSearchPress={handleSearchTalentPress}
              onManageContentPress={handleManageContentPress}
            />
          </View>

          {/* Booked Out Dates */}
          <BookedOutDatesSection onEditPress={handleEditAvailabilityPress} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundGradientView>
  );
}
