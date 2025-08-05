import React from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function ExperiencesScreen() {
  const handleContinue = async () => {
    try {
      // TODO: Implement experiences form logic
      console.log('Experiences step - implement form logic');
    } catch (error) {
      console.error('Error in experiences step:', error);
    }
  };

  return (
    <BaseOnboardingScreen
      title="Add your experience"
      description="Add up to 3 projects you’ve worked on that you would like displayed on your profile."
      canProgress={false}
      primaryAction={{
        onPress: handleContinue,
      }}>
      <View className="flex-1 items-center justify-center"></View>
    </BaseOnboardingScreen>
  );
}
