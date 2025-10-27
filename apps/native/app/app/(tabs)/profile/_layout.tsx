import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}>
        <Stack.Screen
          name="index"
          options={{
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            title: 'About',
          }}
        />
        <Stack.Screen
          name="media"
          options={{
            title: 'Media',
          }}
        />
        <Stack.Screen
          name="highlights"
          options={{
            title: 'Highlights',
          }}
        />
        <Stack.Screen
          name="sizes"
          options={{
            title: 'Sizes',
          }}
        />
        <Stack.Screen
          name="socials"
          options={{
            title: 'Socials',
          }}
        />
        <Stack.Screen
          name="agent"
          options={{
            title: 'Agent',
          }}
        />
        <Stack.Screen
          name="skills"
          options={{
            title: 'Skills',
          }}
        />
        <Stack.Screen
          name="training"
          options={{
            title: 'Training',
          }}
        />
      </Stack>
  );
}
