import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { TabView, type TabRoute } from '~/components/ui/tabs/TabView';
import { TypecastDetails } from './TypecastDetails';
import { ProfileAboutTab } from './ProfileAboutTab';
import { ProfileResumeTab } from './ProfileResumeTab';
import { ProfileVisualsTab } from './ProfileVisualsTab';
import { type DancerProfileData } from '@packages/backend/convex/dancers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/button';
import { Icon } from '~/lib/icons/Icon';
import { router } from 'expo-router';
import { ProjectCarousel } from './ProjectCarousel';

interface ProfileDetailsSheetProps {
  profileData: DancerProfileData;
  onCollapseIntent: () => void;
}

function TopBar({ onCollapseIntent }: { onCollapseIntent: () => void }) {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Navigate to home/default screen
      router.replace('/');
    }
  };
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 8,
        }}>
        {/* Close button (left) */}
        <Button onPress={handleClose} variant="tertiary">
          <Icon name="xmark" size={20} className="text-icon-default" />
        </Button>

        {/* Profile Details button (right) */}
        <Button variant="tertiary" onPress={onCollapseIntent}>
          <Icon name="person.text.rectangle.fill" size={28} className="text-icon-default" />
        </Button>
      </View>
    </View>
  );
}

export function ProfileDetailsSheet({ profileData, onCollapseIntent }: ProfileDetailsSheetProps) {
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
    <TabView
      routes={tabs}
      renderScene={renderScene}
      initialKey="resume"
      tabStyle="pill"
      tabContainerClassName="px-4 pb-6"
    // contentClassName="bg-surface-high"
    />
  );
}
