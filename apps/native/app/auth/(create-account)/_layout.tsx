import { Stack, router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { ProgressBar } from '~/components/ui/progress-bar';
import { useSignupProgress } from '~/hooks/useSignupNavigation';
import X from '~/lib/icons/X';

export default function CreateAccountLayout() {
  const navigation = useNavigation();
  const progressData = useSignupProgress();

  // Map the signup steps to progress indices
  const getStepIndex = (step: string) => {
    const stepMapping = {
      phone: 0,
      'verify-phone': 1,
      name: 2,
      email: 3,
      dob: 4,
      complete: 6,
    };
    return stepMapping[step as keyof typeof stepMapping] || 0;
  };

  const currentStepIndex = getStepIndex(progressData.step);

  // Update header when progress changes
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Create Account',
      header: () => {
        return (
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <View className="h-8 flex-row items-center bg-transparent pl-4 pr-0">
              <ProgressBar currentStep={currentStepIndex} totalSteps={6} label="ACCOUNT" />
              <Button
                variant="plain"
                size="icon"
                className="px-0"
                onPress={() => {
                  // Navigate back to the root with a dismiss animation
                  router.dismissAll();
                }}>
                <X size={24} className="color-icon-default" strokeWidth={1.5} />
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
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
