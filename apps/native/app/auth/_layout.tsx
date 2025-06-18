import { Stack } from 'expo-router';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';

export default function AuthLayout() {
  return (
    <BackgroundGradientView>
      <Stack screenOptions={{ ...SCREEN_OPTIONS }}>
        <Stack.Screen name="(login)" options={LOGIN_SCREEN_OPTIONS} />
        <Stack.Screen name="(create-account)" options={CREATE_ACCOUNT_SCREEN_OPTIONS} />
      </Stack>
    </BackgroundGradientView>
  );
}

const SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: {
    backgroundColor: 'transparent',
  },
} as const;

const LOGIN_SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: {
    backgroundColor: 'transparent',
  },
} as const;

const CREATE_ACCOUNT_SCREEN_OPTIONS = {
  contentStyle: {
    backgroundColor: 'transparent',
  },
} as const;
