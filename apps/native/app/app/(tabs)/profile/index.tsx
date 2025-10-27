import React, { useState } from 'react';
import { View } from 'react-native';

import { ProfileScreenLayout } from '~/components/layouts/ProfileScreenLayout';
import {
  ProfileHeaderSettingsButton,
  ProfileHeaderTitle,
} from '~/components/profile/ProfileHeader';
import { SectionCardPager } from '~/components/profile/SectionCardPager';
import {
  ProfessionalExperienceHeader,
  ProfessionalExperienceList,
  ProfessionalExperienceSheet,
  useProfessionalExperience,
} from '~/components/profile/ProfessionalExperienceSection';

export default function ProfileScreen() {
  const [isCardsOpen, setIsCardsOpen] = useState(true);
  const {
    activeTab,
    setActiveTab,
    experiences,
    handleItemPress,
    isSheetOpen,
    selectedProjectId,
    handleSheetClose,
  } = useProfessionalExperience();

  function handleToggle() {
    setIsCardsOpen(!isCardsOpen);
  }

  return (
    <>
      <ProfileScreenLayout
        header={{
          middle: ProfileHeaderTitle,
          right: ProfileHeaderSettingsButton,
        }}
        isCollapsed={!isCardsOpen}
        collapsibleContent={
          <View className="gap-8">
            <SectionCardPager />
            <View className="mx-4 h-px bg-border-tint" />
          </View>
        }
        sectionHeader={
          <ProfessionalExperienceHeader
            isCardsOpen={isCardsOpen}
            onToggle={handleToggle}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        }>
        <ProfessionalExperienceList experiences={experiences} onItemPress={handleItemPress} />
      </ProfileScreenLayout>

      <ProfessionalExperienceSheet
        isOpen={isSheetOpen}
        onOpenChange={handleSheetClose}
        projectId={selectedProjectId}
      />
    </>
  );
}
