import React from 'react';
import { View } from 'react-native';

import { HeightPicker } from '~/components/form/HeightPicker';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { Text } from '~/components/ui/text';
import { useHeightForm } from '~/hooks/useHeightForm';

export default function HeightScreen() {
  const heightForm = useHeightForm();

  const handleSubmit = async () => {
    await heightForm.actions.submitHeight();
  };

  const title = 'How tall are you?';
  const description = 'Select height';

  return (
    <OnboardingStepGuard requiredStep="height">
      <BaseOnboardingScreen
        title={title}
        description={description}
        canProgress={heightForm.models.isValid}
        primaryAction={{
          onPress: handleSubmit,
        }}
        secondaryAction={{
          onPress: () => {}, // No action needed, just display
          text: heightForm.models.formattedHeight,
        }}>
        <HeightPicker value={heightForm.models.height} onChange={heightForm.actions.setHeight} />

        {heightForm.models.error && (
          <View className="mt-4 px-4">
            <Text className="text-center text-red-500">{heightForm.models.error}</Text>
          </View>
        )}
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
