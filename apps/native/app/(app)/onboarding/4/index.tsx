import { api } from '@packages/backend/convex/_generated/api';
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, ScrollView } from 'react-native';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function OnboardingResumeScreen() {
  const router = useRouter();
  const updateUser = useMutation(api.users.updateMyUser);

  const handleComplete = async () => {
    await updateUser({
      onboardingStep: ONBOARDING_STEPS.COMPLETE,
    });
    router.replace('/(app)/home');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView className="flex-1 px-6">
      <View className="py-8">
        <Text variant="largeTitle" className="mb-4">
          Build Your Resume
        </Text>
        <Text variant="body" className="text-text-secondary mb-8">
          Add your experience and skills to complete your profile.
        </Text>

        <View className="mb-8">
          <Text variant="body" className="text-text-secondary">
            This is the Resume step. Experience and skills forms will be added.
          </Text>
        </View>

        <View className="gap-3">
          <Button onPress={handleComplete} size="lg">
            <Text>Complete Onboarding</Text>
          </Button>
          <Button onPress={handleBack} variant="secondary" size="lg">
            <Text>Back</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
