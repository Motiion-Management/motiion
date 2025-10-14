import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Search',
          contentStyle: {
            backgroundColor: 'transparent',
          },
          headerTitleStyle: { color: 'transparent' },
          headerStyle: { backgroundColor: 'transparent' },
          headerSearchBarOptions: {
            placement: 'automatic',
            placeholder: 'Search',
            onChangeText: () => {},
          },
        }}
      />
    </Stack>
  );
}
