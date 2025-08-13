import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="privacy-policy" options={PRIVACY_POLICY_OPTIONS} />
      <Stack.Screen name="terms-and-conditions" options={TERMS_AND_CONDITIONS_OPTIONS} />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  headerShown: true,
} as const;

const PRIVACY_POLICY_OPTIONS = {
  behavior: 'modal',
  title: 'Privacy Policy',
} as const;

const TERMS_AND_CONDITIONS_OPTIONS = {
  behavior: 'modal',
  title: 'Terms and Conditions',
} as const;
