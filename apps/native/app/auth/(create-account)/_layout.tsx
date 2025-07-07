import { Icon } from '@roninoss/icons';
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

const ProgressBar = () => {
  return (
    <View className=" flex-1 flex-row items-center gap-2">
      <Text variant="labelXs" color="primary" className="mr-4">
        Account
      </Text>
      <View className="h-1.5 w-12 rounded border-primary bg-primary-500" />
      <View className="size-1.5  rounded border border-primary bg-surface-default" />
      <View className="size-1.5 rounded border border-primary bg-surface-default" />
      <View className="size-1.5 rounded border border-primary bg-surface-default" />
    </View>
  );
};

export default function CreateAccountLayout() {
  return (
    <>
      <Stack.Screen options={{ ...SCREEN_OPTIONS, title: 'Create Account' }} />
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
          <ProgressBar />
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
