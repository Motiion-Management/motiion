import { Redirect } from 'expo-router';

export default function OnboardingStep1() {
  // Redirect to the new profile-type route
  return <Redirect href="/(app)/onboarding/profile-type" />;
}
