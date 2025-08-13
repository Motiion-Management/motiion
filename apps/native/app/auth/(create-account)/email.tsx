import { useSignUp } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseAuthScreen } from '~/components/layouts/BaseAuthScreen';
import { Text } from '~/components/ui/text';

const formValidator = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
});

export default function EmailScreen() {
  const { isLoaded, signUp } = useSignUp();
  const [signupError, setSignupError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onChange: formValidator,
    },
    onSubmit: async ({ value }) => {
      if (!isLoaded || !signUp) {
        setSignupError('Authentication service not ready. Please try again.');
        return;
      }

      setSignupError(null);

      try {
        // Update the sign up with the user's email
        await signUp.update({
          emailAddress: value.email.trim().toLowerCase(),
        });

        // Navigate to the next screen
        router.push('/auth/(create-account)/dob');
      } catch (error: any) {
        const errorMessage =
          error.errors?.[0]?.message || 'Failed to update email. Please try again.';
        setSignupError(errorMessage);
      }
    },
  });

  const isFormReady = useStore(form.store, (state) => state.canSubmit);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BaseAuthScreen
      title="Enter a valid email"
      helpText="Providing an email helps keep your account secure and will be used for your profile contact information."
      canProgress={isFormReady}
      primaryAction={{
        onPress: () => {
          form.handleSubmit();
        },
      }}>
      <ValidationModeForm form={form}>
        <View className="min-h-12 flex-1 flex-col gap-6">
          <form.AppField
            name="email"
            children={(field) => (
              <field.InputField
                label="Email"
                placeholder="Enter your email"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
                keyboardType="email-address"
              />
            )}
          />
          {signupError && <Text className="text-sm text-text-error">{signupError}</Text>}
        </View>
      </ValidationModeForm>
    </BaseAuthScreen>
  );
}
