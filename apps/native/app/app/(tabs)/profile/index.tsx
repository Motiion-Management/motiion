import React from 'react';
import { View } from 'react-native';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import {
  ProfileHeaderSettingsButton,
  ProfileHeaderTitle,
} from '~/components/profile/ProfileHeader';
import { SectionCardPager } from '~/components/profile/SectionCardPager';
import { ProfessionalExperienceSection } from '~/components/profile/ProfessionalExperienceSection';

export default function ProfileScreen() {
  return (
    <TabScreenLayout
      header={{
        left: <View className="size-10" />,
        middle: (slot) => <ProfileHeaderTitle {...slot} />,
        right: (slot) => <ProfileHeaderSettingsButton {...slot} />,
      }}>
      <View className="gap-8">
        {/* Section Cards Pager */}
        <SectionCardPager />

        {/* Divider */}
        <View className="mx-4 h-px bg-border-tint" />

        {/* Professional Experience Section */}
        <View className="px-4">
          <ProfessionalExperienceSection />
        </View>
      </View>
    </TabScreenLayout>
  );
}
