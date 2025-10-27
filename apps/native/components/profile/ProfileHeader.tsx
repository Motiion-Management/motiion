import React from 'react';
import { router } from 'expo-router';

import { HeaderActionButton } from '~/components/ui/animated-scroll-header';
import { HeaderTitle } from '../ui/animated-scroll-header/HeaderTitle';
import type { TabHeaderSlot } from '~/components/layouts/TabScreenLayout';

export function ProfileHeaderTitle(_: TabHeaderSlot) {
  return <HeaderTitle title="Profile" />;
}

export function ProfileHeaderSettingsButton({ scrollProgress }: TabHeaderSlot) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="gear"
      onPress={() => router.push('/app/(tabs)/profile/settings')}
    />
  );
}
