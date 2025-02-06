import { Stack } from 'expo-router';

export default function CreateAccountLayout() {
  return (
    <>
      <Stack.Screen options={{ ...SCREEN_OPTIONS, title: 'Create Account' }} />
      <Stack screenOptions={SCREEN_OPTIONS} />
    </>
  );
}

const SCREEN_OPTIONS = {
  headerShown: false,
} as const;
