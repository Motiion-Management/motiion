import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '~/components/ui/progress-bar';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

const OnboardingHeader = ({ route }: NativeStackHeaderProps) => {
  const stepName = route.name;
  const cursor = useOnboardingCursor();
  const { getStepLabel } = useOnboardingStatus(stepName);

  return (
    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <View className="h-8 flex-row items-center bg-transparent pl-4 pr-0">
        <ProgressBar
          currentStep={cursor.currentStepIndex}
          totalSteps={cursor.totalSteps}
          label={getStepLabel(cursor.currentStep)}
        />
      </View>
    </SafeAreaView>
  );
};

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: 'Profile Setup',
        header: OnboardingHeader,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'default',
        gestureEnabled: true,
      }}
    />
  );
}
