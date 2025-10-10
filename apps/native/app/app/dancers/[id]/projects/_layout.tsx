import { Stack, router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';

import { Icon } from '~/lib/icons/Icon';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

const ProjectsHeader = ({ route }: { route: any }) => {
  const dancerId = route.params?.id as Id<'dancers'>;
  const profileData = useQuery(
    api.dancers.getDancerProfileWithDetails,
    dancerId ? { dancerId } : 'skip'
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('./../index');
    }
  };

  const handleNavigateToProfile = () => {
    router.push('./../index');
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="bg-background-nav border-b border-border-tint">
      <View className="flex-row items-center justify-between px-2 py-6">
        <Button onPress={handleBack} variant="tertiary">
          <Icon name="chevron.left" size={20} className="text-icon-default" />
        </Button>

        <View className="flex-col items-center gap-1">
          <Text variant="labelXs" className="uppercase text-white">
            {profileData?.dancer.displayName || ''}
          </Text>
          <Text variant="header5" className="text-white">
            Dancer
          </Text>
        </View>

        <Button onPress={handleNavigateToProfile} variant="tertiary">
          <Icon name="person.text.rectangle.fill" size={28} className="text-icon-default" />
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header: (props) => <ProjectsHeader route={props.route} />,
        }}
      />
      <Stack.Screen
        name="[projectId]"
        options={{
          headerShown: true,
          header: (props) => <ProjectsHeader route={props.route} />,
        }}
      />
    </Stack>
  );
}
