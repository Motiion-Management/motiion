import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '~/components/ui/progress-bar';

const OnboardingHeader = ({ route }: NativeStackHeaderProps) => {
  // Simple header without dynamic progress - app layout handles onboarding flow
  const stepName = route.name;
  
  // Basic step mapping for display
  const getStepLabel = (step: string) => {
    switch (step) {
      case 'profile-type':
        return 'PROFILE';
      case 'headshots':
      case 'height':
      case 'ethnicity':
      case 'hair-color':
      case 'eye-color':
      case 'gender':
      case 'sizing':
      case 'location':
      case 'work-location':
      case 'representation':
      case 'experiences':
      case 'training':
      case 'skills':
      case 'union':
        return 'DANCER';
      case 'database-use':
      case 'company':
        return 'GUEST';
      default:
        return 'ONBOARDING';
    }
  };

  return (
    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <View className="h-8 flex-row items-center bg-transparent pl-4 pr-0">
        <ProgressBar currentStep={1} totalSteps={10} label={getStepLabel(stepName)} />
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
        animation: 'slide_from_right',
      }}
    />
  );
}
