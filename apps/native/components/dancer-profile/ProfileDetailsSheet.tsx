import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { TabView, type TabRoute } from '~/components/ui/tabs/TabView';
import { TypecastDetails } from './TypecastDetails';
import { ProfileAboutTab } from './ProfileAboutTab';
import { ProfileResumeTab } from './ProfileResumeTab';
import { ProfileVisualsTab } from './ProfileVisualsTab';
import { type Doc } from '@packages/backend/convex/_generated/dataModel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/button';
import { Icon } from '~/lib/icons/Icon';
import { router } from 'expo-router';

interface ProfileDetailsSheetProps {
  dancer: Doc<'dancers'>;
  recentProjects: Array<any>;
  allProjects: Array<any>;
  training: Array<any>;
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
        <Button onPress={handleClose} variant="plain">
          <Icon name="xmark" size={20} className="text-icon-default" />
        </Button>

        {/* Profile Details button (right) */}
        <Button variant="plain" onPress={onCollapseIntent}>
          <Icon name="person.text.rectangle.fill" size={28} className="text-icon-default" />
        </Button>
      </View>
    </View>
  );
}

export function ProfileDetailsSheet({
  dancer,
  recentProjects,
  allProjects,
  training,
  onCollapseIntent,
}: ProfileDetailsSheetProps) {
  const displayName = dancer.displayName || 'Dancer';

  const tabs: Array<TabRoute> = [
    { key: 'about', title: 'About' },
    { key: 'resume', title: 'Resume' },
    { key: 'visuals', title: 'Visuals' },
  ];

  const renderScene = (route: TabRoute) => {
    switch (route.key) {
      case 'about':
        return <ProfileAboutTab dancer={dancer} recentProjects={recentProjects} />;
      case 'resume':
        return <ProfileResumeTab dancer={dancer} allProjects={allProjects} training={training} />;
      case 'visuals':
        return <ProfileVisualsTab />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="h-screen flex-1 rounded-t-3xl">
      {/* Header */}
      <View className="gap-2 px-4 pt-4">
        <TopBar onCollapseIntent={onCollapseIntent} />
        <View className="items-center">
          <Text variant="labelXs">{displayName}</Text>
          <Text variant="header5">Dancer</Text>
        </View>
        <TypecastDetails dancer={dancer} />
      </View>

      {/* Tabs */}
      <View className="mt-4 flex-1">
        <TabView
          routes={tabs}
          renderScene={renderScene}
          initialKey="about"
          tabStyle="pill"
          tabContainerClassName="px-4"
        />
      </View>
    </SafeAreaView>
  );
}
