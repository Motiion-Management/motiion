import { useSignUp } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isValidNumber } from 'react-native-phone-entry';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { determineSignupStep } from '~/utils/signupNavigation';

const formValidator = z.object({
  phone: z
    .object({
      fullNumber: z.string().min(7, {
        message:
          'International phone numbers must be at least 7 digits, including the country prefix',
      }),
      countryCode: z.string().length(2),
    })
    .refine(
      ({ fullNumber, countryCode }) => isValidNumber(fullNumber, countryCode),
      ({ countryCode }) => ({ message: `Please provide a valid ${countryCode} phone number.` })
    ),
});
export default function InfoScreen() {
  const { isLoaded, signUp } = useSignUp();
  const pathname = usePathname();
  const hasNavigatedRef = useRef(false);

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
      if (!isLoaded || !signUp) {
        console.error('SignUp is not available');
        return;
      }
      try {
        await signUp.create({
          phoneNumber: value.phone.fullNumber,
        });
        signUp.preparePhoneNumberVerification();
        router.push('/auth/(create-account)/verify-phone');
      } catch (error: any) {
        console.warn('Error creating sign up:', error);

        // Check if the error is due to phone number already existing
        if (
          error.errors &&
          error.errors.some(
            (err: any) =>
              err.code === 'form_identifier_exists' ||
              err.message?.toLowerCase().includes('already exists')
          )
        ) {
          // Phone number already exists, redirect to login with the phone number
          router.replace({
            pathname: '/auth/(login)',
            params: { phoneNumber: value.phone.fullNumber },
          });
          return;
        }

        // Handle other errors as needed
        console.error('Signup error:', error);
      }
    },
  });

  useEffect(() => {
    if (!isLoaded || !signUp || hasNavigatedRef.current) return;

    // Check if there's an existing signup in progress and navigate to the appropriate step
    const targetRoute = determineSignupStep(signUp);

    // Only navigate if we're not already on the target route and it's different from current route
    if (targetRoute && targetRoute !== pathname && targetRoute !== '/auth/(create-account)') {
      hasNavigatedRef.current = true;
      router.replace(targetRoute as any);
      return;
    }

    // Legacy check for phone verification (kept for backwards compatibility)
    const { status, id } = signUp.verifications.phoneNumber;
    if (id && status !== 'expired' && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      router.push('/auth/(create-account)/verify-phone');
    }
  }, [isLoaded, signUp, pathname]);

  const isFormReady = useStore(form.store, (state) => state.canSubmit);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BaseOnboardingScreen
      title="What's your phone number?"
      canProgress={isFormReady}
      primaryAction={{
        onPress: () => {
          form.handleSubmit();
        },
      }}>
      <ValidationModeForm form={form}>
        <View className="min-h-12 flex-1 flex-row gap-6">
          <form.AppField name="phone" children={(field) => <field.PhoneNumber autoFocus />} />
        </View>
      </ValidationModeForm>
    </BaseOnboardingScreen>
  );
}
