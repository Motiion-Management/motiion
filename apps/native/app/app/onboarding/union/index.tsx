import React from 'react';
import { View, Text } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { useMutation, useQuery } from 'convex/react';
import { useAppForm } from '~/components/form/appForm';
import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useUser } from '~/hooks/useUser';
import { api } from '@packages/backend/convex/_generated/api';
import * as z from 'zod';

const unionValidator = z.object({
  sag: z.string().optional(),
});

export default function UnionScreen() {
  const user = useQuery(api.users.getMyUser);
  const updateUser = useMutation(api.users.updateMyUser);

  const form = useAppForm({
    defaultValues: {
      sag: user,
    },
    validators: {
      onChange: unionValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.sag) return;

      // Save the representation status
      await updateUser({
        sag: value.sag,
      });
    },
  });

  return (
    <BaseOnboardingScreen
      title="Are you a member of SAG-AFTRA?"
      description="Enter your member ID. Please skip if you are not a member."
      canProgress={false} // TODO: Set to true when form is filled
      primaryAction={{
        onPress: handleContinue,
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
