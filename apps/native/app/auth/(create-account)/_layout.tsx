import { useSignUp } from '@clerk/clerk-expo';
import { Icon } from '@roninoss/icons';
import { Stack, router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useSignupProgress } from '~/hooks/useSignupNavigation';

const DynamicProgressBar = ({ currentStepIndex }: { currentStepIndex: number }) => {
  const totalSteps = 6; // phone, verify-phone, name, email, dob, username
  const steps = Array.from({ length: totalSteps }, (_, index) => index);

  console.log('🟢 DynamicProgressBar render - currentStepIndex:', currentStepIndex);

  return (
    <View className=" flex-1 flex-row items-center gap-2">
      <Text variant="labelXs" color="primary" className="mr-4">
        ACCOUNT
      </Text>
      {steps.map((stepIndex) => {
        const isCurrentStep = stepIndex === currentStepIndex;
        const isCompletedStep = stepIndex < currentStepIndex;

        console.log(`Step ${stepIndex}: current=${isCurrentStep}, completed=${isCompletedStep}`);

        if (isCurrentStep) {
          // Current step: stretched bar
          return (
            <View key={stepIndex} className="h-1.5 w-12 rounded border-primary bg-primary-500" />
          );
        } else if (isCompletedStep) {
          // Completed step: filled dot
          return (
            <View
              key={stepIndex}
              className="size-1.5 rounded border border-primary bg-primary-500"
            />
          );
        } else {
          // Future step: empty dot
          return (
            <View
              key={stepIndex}
              className="size-1.5 rounded border border-primary bg-surface-default"
            />
          );
        }
      })}
    </View>
  );
};

export default function CreateAccountLayout() {
  const navigation = useNavigation();
  const progressData = useSignupProgress();

  // Debug: Log what step we're detecting
  console.log('🎯 Layout component - step detection:', {
    detectedStep: progressData.step,
    completedData: progressData.completedData,
  });

  // Map the signup steps to progress indices
  const getStepIndex = (step: string) => {
    const stepMapping = {
      phone: 0,
      'verify-phone': 1,
      name: 2,
      email: 3,
      dob: 4,
      username: 5,
      complete: 6,
    };
    return stepMapping[step as keyof typeof stepMapping] || 0;
  };

  const currentStepIndex = getStepIndex(progressData.step);

  console.log('📊 Layout component - progress mapping:', {
    step: progressData.step,
    mappedIndex: currentStepIndex,
  });

  const { signUp } = useSignUp();
  // Update header when progress changes
  useEffect(() => {
    console.log('⚡ Layout useEffect - updating header with step index:', currentStepIndex);

    navigation.setOptions({
      headerShown: true,
      title: 'Create Account',
      header: () => {
        console.log('🎯 Header render - currentStepIndex:', currentStepIndex);
        return (
          <SafeAreaView>
            <View className="h-8 flex-row items-center bg-transparent px-4">
              <DynamicProgressBar currentStepIndex={currentStepIndex} />
              <Button
                variant="plain"
                size="icon"
                className="ios:px-0"
                onPress={() => {
                  // Navigate back to the root with a dismiss animation

                  router.dismissAll();
                }}>
                <Icon name="close" size={24} color="currentColor" />
              </Button>
            </View>
          </SafeAreaView>
        );
      },
    });
  }, [navigation, currentStepIndex]);

  return (
    <>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      />
    </>
  );
}
