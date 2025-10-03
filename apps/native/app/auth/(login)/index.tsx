import { useSignIn } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isValidNumber } from 'react-native-phone-entry';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseAuthScreen } from '~/components/layouts/BaseAuthScreen';
import { Text } from '~/components/ui/text';
// Forward navigation is declarative via button press; no auto-redirect on mount

const formValidator = z.object({
  phone: z
    .object({
      fullNumber: z.string().min(7, {
        message:
          'International phone numbers must be at least 7 digits, including the country prefix',
      }),
      countryCode: z.string().length(2),
    })
    .refine(({ fullNumber, countryCode }) => isValidNumber(fullNumber, countryCode), {
      message: 'Please provide a valid phone number.',
    }),
});

export default function LoginScreen() {
  const { isLoaded, signIn } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const hasNavigatedRef = useRef(false);
  const { phoneNumber: paramPhoneNumber } = useLocalSearchParams<{ phoneNumber?: string }>();

  const form = useAppForm({
    defaultValues: {
      phone: {
        fullNumber: '+1',
        countryCode: 'US',
      },
    },
    validators: {
      onSubmit: formValidator,
    },
    onSubmit: async ({ value }) => {
      if (!isLoaded || !signIn) {
        setSignInError('Authentication service not ready. Please try again.');
        return;
      }

      setIsSubmitting(true);
      setSignInError(null);

      try {
        // Create a new sign-in attempt
        const result = await signIn.create({
          identifier: value.phone.fullNumber,
        });

        // Prepare the first factor verification (phone code)
        await result.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: result.supportedFirstFactors?.find(
            (factor) => factor.strategy === 'phone_code'
          )?.phoneNumberId!,
        });

        // Navigate to verification page
        router.push('/auth/(login)/verify-phone');
      } catch (error: any) {
        const errorMessage = error.errors?.[0]?.message || 'Failed to sign in. Please try again.';
        setSignInError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Removed auto-redirect effect to avoid push→replace stutter.

  const isFormReady = useStore(form.store, (state) => state.canSubmit && !isSubmitting);

  // Show loading if we're in transfer mode or still loading
  if (!isLoaded || paramPhoneNumber) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BaseAuthScreen
      title="Welcome back!"
      helpText="Enter your phone number to sign in to your account."
      canProgress={isFormReady}
      primaryAction={{
        onPress: () => {
          form.handleSubmit();
        },
      }}
      secondaryAction={{
        onPress: () => {
          router.replace('/auth/(create-account)');
        },
        text: "Don't have an account?",
      }}>
      <ValidationModeForm form={form}>
        <View className="min-h-12 flex-1 flex-col gap-6">
          <form.AppField name="phone" children={(field) => <field.PhoneNumber autoFocus />} />
          {signInError && <Text className="text-sm text-text-error">{signInError}</Text>}
          {isSubmitting && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Text className="text-sm text-text-disabled">Signing in...</Text>
            </View>
          )}
        </View>
      </ValidationModeForm>
    </BaseAuthScreen>
  );
}
