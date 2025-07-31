import { Link, Stack } from 'expo-router';
import { usePathname } from 'expo-router';

import { View } from 'react-native';

import { Text } from '~/components/ui/text';

export default function NotFoundScreen() {
  const pathname = usePathname();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-background-default p-5">
        <Text variant="largeTitle">This screen doesn't exist.</Text>
        <Text className="mt-2 text-muted-foreground">
          The path <Text className="font-bold">{pathname}</Text> does not match any screens.
        </Text>

        <Link href="/" className="m-4 py-4">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
