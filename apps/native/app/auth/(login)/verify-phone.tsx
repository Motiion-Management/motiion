import { useSignIn, useClerk } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Text } from '~/components/ui/text';

export default function VerifyPhoneScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const clerk = useClerk();
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
      if (!isLoaded || !signIn) {
        setVerificationError('Authentication service not ready. Please try again.');
        return;
      }

      setIsVerifying(true);
      setVerificationError(null);

      try {
        // Attempt to verify the phone number with the provided OTP
        const result = await signIn.attemptFirstFactor({
          strategy: 'phone_code',
          code: value.otp,
        });

        // Check if sign-in is complete
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          // Navigate to the main app
          router.replace('/home');
        } else {
          setVerificationError('Sign-in incomplete. Please try again.');
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

  // Get the phone number from the sign-in attempt
  const phoneNumber = signIn?.identifier || '+X (XXX) XXX - XXXX';

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
          router.back();
        },
        text: 'Use a different number',
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
                    label: 'Resend',
                    onPress: async () => {
                      try {
                        // Resend the verification code
                        await signIn?.prepareFirstFactor({
                          strategy: 'phone_code',
                          phoneNumberId: signIn.supportedFirstFactors.find(
                            (factor) => factor.strategy === 'phone_code'
                          )?.phoneNumberId!,
                        });
                      } catch (error) {
                        console.error('Failed to resend code:', error);
                      }
                    },
                  },
                }}
              />
            )}
          />
          {verificationError && (
            <Text className="text-sm text-text-error">{verificationError}</Text>
          )}
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
