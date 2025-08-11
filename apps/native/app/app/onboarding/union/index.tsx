import React from 'react';
import { View, Text } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function UnionScreen() {
  // Placeholder screen – union flow not implemented yet
  useQuery(api.users.getMyUser);

  return (
    <BaseOnboardingScreen
      title="Are you a member of SAG-AFTRA?"
      description="Enter your member ID. Please skip if you are not a member."
      canProgress={false} // TODO: Set to true when form is filled
      primaryAction={{
        onPress: () => {},
        disabled: true, // TODO: Enable when form is valid
      }}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-gray-500">Union status form will be implemented here</Text>
        <Text className="mt-2 text-sm text-gray-400">
          This will include union membership status and relevant details
        </Text>
      </View>
    </BaseOnboardingScreen>
  );
}
