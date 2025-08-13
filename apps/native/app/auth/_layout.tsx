import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ ...SCREEN_OPTIONS }}>
      <Stack.Screen
        name="(login)"
        options={{
          ...LOGIN_SCREEN_OPTIONS,
        }}
      />
      <Stack.Screen
        name="(create-account)"
        options={{
          ...CREATE_ACCOUNT_SCREEN_OPTIONS,
        }}
      />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  animation: 'slide_from_right',
  headerShown: false,
  contentStyle: {
    backgroundColor: 'transparent',
  },
} as const;

const LOGIN_SCREEN_OPTIONS = {
  contentStyle: {
    backgroundColor: 'transparent',
  },
} as const;

const CREATE_ACCOUNT_SCREEN_OPTIONS = {
  contentStyle: {
    backgroundColor: 'transparent',
  },
} as const;
