import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { type SharedValue } from 'react-native-reanimated';
import { PagerTabView, type TabRoute } from '~/components/ui/tabs/PagerTabView';
import { ProfileAboutTab } from './ProfileAboutTab';
import { ProfileResumeTab } from './ProfileResumeTab';
import { ProfileVisualsTab } from './ProfileVisualsTab';
import { type DancerProfileData } from '@packages/backend/convex/dancers';
import { PROFILE_SHEET_EXPANDED_HEIGHT } from '~/components/profile-sheet/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileDetailsSheetProps {
  profileData: DancerProfileData;
  animatedIndex: SharedValue<number>;
  headerHeight: number;
}

export function ProfileDetailsSheet({ profileData, animatedIndex, headerHeight }: ProfileDetailsSheetProps) {
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

  // Calculate available height for content: (screen height × expanded %) - header height
  const contentHeight = useMemo(
    () => SCREEN_HEIGHT * (PROFILE_SHEET_EXPANDED_HEIGHT / 100) - headerHeight,
    [headerHeight]
  );

  return (
    <View style={{ height: contentHeight }}>
      <PagerTabView
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
