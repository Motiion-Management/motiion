import React from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { ExperienceSection } from '~/components/experiences/ExperienceSection';
import { ExperienceEditSheet } from '~/components/experiences/ExperienceEditSheet';
import { useExperiences } from '~/hooks/useExperiences';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function ExperiencesScreen() {
  const onboarding = useSimpleOnboardingFlow();
  const {
    experiences,
    currentEditingIndex,
    isSheetOpen,
    handleExperiencePress,
    handleSheetOpenChange,
    handleSaveExperience,
    handleDeleteExperience,
    saveToBackend,
    getCurrentExperience,
    canProgress,
    isNewExperience,
  } = useExperiences();

  const handleContinue = async () => {
    try {
      await saveToBackend();
      console.log('Experiences saved successfully');
    } catch (error) {
      console.error('Error saving experiences:', error);
    }
  };

  return (
    <BaseOnboardingScreen
      title="Add your experience"
      description="Add up to 3 projects you've worked on that you would like displayed on your profile."
      canProgress={canProgress()}
      primaryAction={{
        onPress: handleContinue,
      }}
      secondaryAction={{
        text: 'Skip for now',
        onPress: () => onboarding.navigateNext(),
      }}>
      <View className="flex-1">
        <ExperienceSection
          experiences={experiences}
          onExperiencePress={handleExperiencePress}
          maxExperiences={3}
        />
      </View>

      <ExperienceEditSheet
        isOpen={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        experience={getCurrentExperience()}
        onSave={handleSaveExperience}
        onDelete={currentEditingIndex !== null ? handleDeleteExperience : undefined}
        isNew={isNewExperience}
      />
    </BaseOnboardingScreen>
  );
}
