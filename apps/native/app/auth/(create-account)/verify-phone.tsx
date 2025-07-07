import { useSignUp } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import z from 'zod';

import { useAppForm } from '~/components/form/appForm';
import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Text } from '~/components/ui/text';

export default function InfoScreen() {
  const { isLoaded, signUp } = useSignUp();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Simple synchronous validation for OTP format
  const otpSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' }),
  });

  const form = useAppForm({
    defaultValues: {
      otp: '',
    },
    validators: {
      onChange: otpSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isLoaded || !signUp) {
        setVerificationError('Authentication service not ready. Please try again.');
        return;
      }

      setIsVerifying(true);
      setVerificationError(null);

      try {
        // Attempt to verify the phone number with the provided OTP
        const result = await signUp.attemptPhoneNumberVerification({
          code: value.otp,
        });

        // Check if verification was successful
        if (result.verifications.phoneNumber.status === 'verified') {
          router.push('/auth/(create-account)/name');
        } else {
          setVerificationError('Verification failed. Please try again.');
        }
      } catch (error: any) {
        // Handle Clerk-specific errors
        const errorMessage =
          error.errors?.[0]?.message || 'Invalid verification code. Please try again.';
        setVerificationError(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    },
  });

  const isFormReady = useStore(
    form.store,
    (state) => state.canSubmit && state.values.otp.length === 6 && !isVerifying
  );

  const phoneNumber = signUp?.phoneNumber || '+X (XXX) XXX - XXXX';

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BaseOnboardingScreen
      title="Enter your verification code"
      canProgress={isFormReady}
      primaryAction={{
        onPress: () => {
          form.handleSubmit();
        },
      }}
      secondaryAction={{
        onPress: () => {
          router.replace('/auth/(login)');
        },
        text: 'Already have an account?',
      }}>
      <ValidationModeForm form={form}>
        <View className="min-h-12 flex-1 flex-col gap-6">
          <form.AppField
            name="otp"
            children={(field) => (
              <field.PhoneOTP
                helperTextOpts={{
                  message: `Code sent to ${phoneNumber}.`,
                  action: {
                    label: 'Change',
                    onPress: () => {
                      router.back();
                    },
                  },
                }}
              />
            )}
          />
          {verificationError && <Text className="text-sm text-text-error">{verificationError}</Text>}
          {isVerifying && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Text className="text-sm text-text-disabled">Verifying...</Text>
            </View>
          )}
        </View>
      </ValidationModeForm>
    </BaseOnboardingScreen>
  );
}
