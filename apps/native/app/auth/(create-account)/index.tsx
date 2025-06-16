import { useSignUp } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isValidNumber } from 'react-native-phone-entry';
import * as z from 'zod';

import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

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
      } catch (error) {
        console.error('Error creating sign up:', error);
      }
    },
  });

  useEffect(() => {
    if (!signUp) return;
    const { status, id } = signUp.verifications.phoneNumber;
    if (id && status !== 'expired') {
      router.push('/auth/(create-account)/verify-phone');
    }
  }, [signUp?.verifications.phoneNumber]);

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
      <View className="min-h-12 flex-1 flex-row gap-6">
        <form.AppField name="phone" children={(field) => <field.PhoneNumber />} />
      </View>
    </BaseOnboardingScreen>
  );
}
