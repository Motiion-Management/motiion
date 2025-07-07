import { Icon } from '@roninoss/icons';
import { Stack, router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { ProgressBar } from '~/components/ui/progress-bar';
import { useSignupProgress } from '~/hooks/useSignupNavigation';

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
      username: 5,
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
          <SafeAreaView>
            <View className="h-8 flex-row items-center bg-transparent px-4">
              <ProgressBar currentStep={currentStepIndex} totalSteps={6} label="ACCOUNT" />
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
