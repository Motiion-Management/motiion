import React from 'react';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { HeightPicker } from '~/components/form/HeightPicker';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { Text } from '~/components/ui/text';
import { useHeightForm } from '~/hooks/useHeightForm';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';

export default function HeightScreen() {
  const heightForm = useHeightForm();
  const cursor = useOnboardingCursor();

  const handleContinue = async () => {
    try {
      // Submit data and advance in one action
      const success = await heightForm.actions.submitHeight();
      if (success) {
        // Navigate to the next step using cursor-based navigation
        cursor.goToNextStep();
      } else {
        // Height form validation failed
        toast.error('Please enter a valid height');
      }
    } catch (error) {
      console.error('Error in height step:', error);

      // Show appropriate error message to user
      if (error instanceof Error) {
        if (error.message.includes('Failed to save')) {
          toast.error('Failed to save height. Please try again.');
        } else {
          toast.error('An error occurred. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <OnboardingStepGuard requiredStep="height">
      <BaseOnboardingScreen
        title="How tall are you?"
        description="Select height"
        canProgress={heightForm.models.isValid}
        primaryAction={{
          onPress: handleContinue,
        }}
        secondaryAction={{
          onPress: () => {}, // No action needed, just display
          text: heightForm.models.formattedHeight,
        }}>
        <View className="flex-1 justify-center">
          <HeightPicker value={heightForm.models.height} onChange={heightForm.actions.setHeight} />

          {heightForm.models.error && (
            <View className="mt-4 px-4">
              <Text className="text-center text-red-500">{heightForm.models.error}</Text>
            </View>
          )}
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
