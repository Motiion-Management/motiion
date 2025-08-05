import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { OnboardingScreenWrapper } from '~/components/onboarding/OnboardingScreenWrapper';
import { CheckCircle2 } from 'lucide-react-native';

export default function CompleteScreen() {
  return <OnboardingScreenWrapper v1Component={CompleteScreenV1} screenName="complete" />;
}

function CompleteScreenV1() {
  return (
    <BaseOnboardingScreen
      title="Welcome!"
      description="Your profile is complete and ready to go."
      canProgress={false}>
      <View className="items-center py-8">
        <CheckCircle2 size={64} className="text-success mb-4" />
        <Text variant="title2" className="mb-2 text-center">
          All Set!
        </Text>
        <Text variant="body" className="mb-8 text-center text-muted-foreground">
          You've successfully completed your profile setup.
        </Text>
        <Button
          variant="accent"
          size="lg"
          onPress={() => {
            router.replace('/app');
          }}>
          <Text>Get Started</Text>
        </Button>
      </View>
    </BaseOnboardingScreen>
  );
}
