import React from 'react';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { HeightPicker } from '~/components/form/HeightPicker';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { Text } from '~/components/ui/text';
import { useHeightForm } from '~/hooks/useHeightForm';
import { useHybridOnboarding } from '~/hooks/useHybridOnboarding';

export default function HeightScreen() {
  const heightForm = useHeightForm();
  const hybrid = useHybridOnboarding();

  const handleSubmit = async () => {
    try {
      // Submit data
      const success = await heightForm.actions.submitHeight();
      if (success && hybrid.isV3Enabled) {
        // Navigate using V3's pre-calculated navigation
        await hybrid.navigateNext();
      } else if (!success) {
        toast.error('Please enter a valid height');
      }
    } catch (error) {
      console.error('Error in height step:', error);
      toast.error('Failed to save height. Please try again.');
    }
  };

  // Track if we've already submitted this value to prevent loops
  const [lastSubmittedValue, setLastSubmittedValue] = React.useState<string | undefined>();

  // Auto-submit effect for V3
  React.useEffect(() => {
    const currentValue = JSON.stringify(heightForm.models.height);
    
    if (
      hybrid.shouldAutoSubmit() && 
      heightForm.models.isValid && 
      heightForm.models.height &&
      currentValue !== lastSubmittedValue // Only submit if value changed
    ) {
      const timer = setTimeout(() => {
        setLastSubmittedValue(currentValue);
        handleSubmit();
      }, hybrid.getSubmitDelay());
      
      return () => clearTimeout(timer);
    }
  }, [
    hybrid.shouldAutoSubmit(),
    hybrid.getSubmitDelay(),
    heightForm.models.isValid,
    heightForm.models.height,
    lastSubmittedValue
  ]);

  // Use V3 step info if available, otherwise use defaults
  const title = hybrid.currentStep?.title || "How tall are you?";
  const description = hybrid.currentStep?.description || "Select height";

  return (
    <OnboardingStepGuard requiredStep="height">
      <BaseOnboardingScreen
        title={title}
        description={description}
        canProgress={heightForm.models.isValid}
        primaryAction={{
          onPress: handleSubmit,
          // V3 handles navigation automatically, V1 uses cursor navigation
          handlesNavigation: hybrid.isV3Enabled,
        }}
        secondaryAction={{
          onPress: () => {}, // No action needed, just display
          text: heightForm.models.formattedHeight,
        }}>
        <View className="flex-1 justify-center">
          <HeightPicker 
            value={heightForm.models.height} 
            onChange={heightForm.actions.setHeight} 
          />

          {heightForm.models.error && (
            <View className="mt-4 px-4">
              <Text className="text-center text-red-500">{heightForm.models.error}</Text>
            </View>
          )}

          {/* Show auto-submit indicator if V3 */}
          {hybrid.isV3Enabled && hybrid.shouldAutoSubmit() && heightForm.models.isValid && (
            <View className="mt-4 px-4">
              <Text className="text-center text-sm text-muted-foreground">
                Saving automatically...
              </Text>
            </View>
          )}
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}