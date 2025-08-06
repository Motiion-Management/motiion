import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { router } from 'expo-router';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function ResumeScreen() {
  const handleUploadResume = async () => { };
  const nav = useSimpleOnboardingFlow();

  const handleSkip = async () => {
    router.push('/app/onboarding/experiences');
  };

  return (
    <OnboardingStepGuard requiredStep="resume">
      <BaseOnboardingScreen
        title="Import your resume"
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleSkip,
          disabled: true, // TODO: Enable when form is valid
        }}
        bottomActionSlot={
          <View className="w-full gap-3">
            <Button size="lg" className="w-full" onPress={handleUploadResume}>
              <Text>Import</Text>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onPress={() => nav.navigatePrevious()}>
              <Text>Go Back</Text>
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onPress={handleSkip}>
              <Text>Enter Manually</Text>
            </Button>
          </View>
        }>
        <Image
          width={350}
          height={350}
          source={require('../../../../assets/images/onboarding/resume.png')}
        />
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
