import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '~/components/nativewindui/Text';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="mt-[25%] flex w-full items-center">
        <Text variant="largeTitle" color="primary">
          motiion
        </Text>
      </View>
    </SafeAreaView>
  );
}
