import React from 'react';
import { View } from 'react-native';
import { TabView, type TabRoute } from '~/components/ui/tabs/TabView';
import { ProfileAboutTab } from './ProfileAboutTab';
import { ProfileResumeTab } from './ProfileResumeTab';
import { ProfileVisualsTab } from './ProfileVisualsTab';
import { type DancerProfileData } from '@packages/backend/convex/dancers';

interface ProfileDetailsSheetProps {
  profileData: DancerProfileData;
}

export function ProfileDetailsSheet({ profileData }: ProfileDetailsSheetProps) {
  const tabs: Array<TabRoute> = [
    { key: 'about', title: 'About' },
    { key: 'resume', title: 'Resume' },
    { key: 'visuals', title: 'Visuals' },
  ];

  const renderScene = (route: TabRoute) => {
    switch (route.key) {
      case 'about':
        return <ProfileAboutTab profileData={profileData} />;
      case 'resume':
        return <ProfileResumeTab profileData={profileData} />;
      case 'visuals':
        return <ProfileVisualsTab />;
      default:
        return null;
    }
  };

  return (
    <View className="min-h-[45vh]">
      <TabView
        routes={tabs}
        renderScene={renderScene}
        initialKey="resume"
        tabStyle="pill"
        tabContainerClassName="px-4 pb-6"
        // contentClassName="bg-surface-high"
      />
    </View>
  );
}
