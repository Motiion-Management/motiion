import { useSignUp, useClerk } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as z from 'zod';

import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Text } from '~/components/ui/text';

const formValidator = z.object({
  preferredName: z
    .string()
    .min(1, { message: 'Preferred name is required' })
    .min(2, { message: 'Preferred name must be at least 2 characters' })
    .max(100, { message: 'Preferred name must be less than 100 characters' })
    .regex(/^[a-zA-Z0-9\s'-_.]+$/, {
      message:
        'Preferred name can only contain letters, numbers, spaces, hyphens, apostrophes, underscores, and periods',
    }),
});

export default function UsernameScreen() {
  const { isLoaded, signUp } = useSignUp();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const clerk = useClerk();

  const form = useAppForm({
    defaultValues: {
      preferredName: '',
    },
    validators: {
      onChange: formValidator,
    },
    onSubmit: async ({ value }) => {
      if (!isLoaded || !signUp) {
        setSignupError('Authentication service not ready. Please try again.');
        return;
      }

      setIsCreatingAccount(true);
      setSignupError(null);

      try {
        // Update the sign up with the user's preferred name
        await signUp.update({
          unsafeMetadata: {
            ...signUp.unsafeMetadata,
            preferredName: value.preferredName.trim(),
          },
        });

        const { status, createdSessionId, missingFields } = await signUp.reload();
        // Complete the signup process

        if (status === 'complete') {
          clerk.setActive({ session: createdSessionId });
          // Navigate to the main app
          router.replace('/home');
        } else if (status === 'missing_requirements') {
          setSignupError(`Missing requirements: ${missingFields.join(', ')}`);
        } else {
          setSignupError(`Account creation incomplete. Please try again. Status: ${status}`);
        }
      } catch (error: any) {
        const errorMessage =
          error.errors?.[0]?.message || 'Failed to create account. Please try again.';
        setSignupError(errorMessage);
      } finally {
        setIsCreatingAccount(false);
      }
    },
  });

  const isFormReady = useStore(form.store, (state) => state.canSubmit && !isCreatingAccount);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BaseOnboardingScreen
      title="What name do you want displayed?"
      helpText="This will be the name displayed on your public profile. If you go by another name, professionally, you should enter it here."
      canProgress={isFormReady}
      primaryAction={{
        onPress: () => {
          form.handleSubmit();
        },
      }}>
      <View className="min-h-12 flex-1 flex-col gap-6">
        <form.AppField
          name="preferredName"
          children={(field) => (
            <field.TextInput
              label="Preferred Name"
              placeholder="Enter your preferred name"
              autoCapitalize="words"
              autoFocus
            />
          )}
        />
        {signupError && <Text className="text-sm text-text-error">{signupError}</Text>}
        {isCreatingAccount && (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" />
            <Text className="text-sm text-text-disabled">Creating your account...</Text>
          </View>
        )}
      </View>
    </BaseOnboardingScreen>
  );
}
