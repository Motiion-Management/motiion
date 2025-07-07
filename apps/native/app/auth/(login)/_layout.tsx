import { Icon } from '@roninoss/icons';
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function LoginLayout() {
  return (
    <>
      <Stack.Screen options={{ ...SCREEN_OPTIONS, title: 'Sign In' }} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      />
    </>
  );
}

const SCREEN_OPTIONS = {
  headerShown: true,
  header: () => {
    return (
      <SafeAreaView>
        <View className="h-8 flex-row items-center bg-transparent px-4">
          <View className="flex-1 flex-row items-center">
            <Text variant="labelXs" color="primary" className="mr-4">
              Sign In
            </Text>
          </View>
          <Button
            variant="plain"
            size="icon"
            className="ios:px-0"
            onPress={() => {
              // Navigate back to the root with a dismiss animation
              router.dismissAll();
            }}>
            <Icon name="close" size={24} color="currentColor" />
          </Button>
        </View>
      </SafeAreaView>
    );
  },
} as const;