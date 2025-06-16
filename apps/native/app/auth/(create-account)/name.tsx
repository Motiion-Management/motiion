import { useSignUp } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as z from 'zod';

import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Text } from '~/components/ui/text';

const formValidator = z.object({
  firstName: z
    .string()
    .min(1, { message: 'First name is required' })
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name must be less than 50 characters' })
    .regex(/^[a-zA-Z\s'-]+$/, {
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
    }),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' })
    .min(2, { message: 'Last name must be at least 2 characters' })
    .max(50, { message: 'Last name must be less than 50 characters' })
    .regex(/^[a-zA-Z\s'-]+$/, {
      message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
    }),
});

export default function NameScreen() {
  const { isLoaded, signUp } = useSignUp();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      firstName: '',
      lastName: '',
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
        // Update the sign up with the user's name
        await signUp.update({
          firstName: value.firstName.trim(),
          lastName: value.lastName.trim(),
        });

        // Navigate to the next screen
        router.push('/auth/email');
      } catch (error: any) {
        const errorMessage =
          error.errors?.[0]?.message || 'Failed to update name. Please try again.';
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
      title="What's your name?"
      helpText="This will be displayed on your profile."
      canProgress={isFormReady}
      primaryAction={{
        onPress: () => {
          form.handleSubmit();
        },
      }}>
      <View className="min-h-12 flex-1 flex-col gap-6">
        <form.AppField
          name="firstName"
          children={(field) => (
            <field.TextInput
              label="First Name"
              placeholder="Enter your first name"
              autoCapitalize="words"
              autoComplete="given-name"
              autoFocus
            />
          )}
        />
        <form.AppField
          name="lastName"
          children={(field) => (
            <field.TextInput
              label="Last Name"
              placeholder="Enter your last name"
              autoCapitalize="words"
              autoComplete="family-name"
            />
          )}
        />
        {signupError && <Text className="text-sm text-text-error">{signupError}</Text>}
        {isCreatingAccount && (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" />
            <Text className="text-sm text-text-disabled">Saving...</Text>
          </View>
        )}
      </View>
    </BaseOnboardingScreen>
  );
}
