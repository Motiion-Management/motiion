import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import z from 'zod';

import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function InfoScreen() {
  const { isLoaded, signUp } = useSignUp();
  // zod validator for form including 1 field of phone
  const phoneSchema = z.object({
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits' })
      .max(15, { message: 'Phone number must be at most 15 digits' }),
  });
  const form = useAppForm({
    defaultValues: {
      phone: '+1',
    },
    validators: {
      onChange: phoneSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isLoaded || !signUp) {
        console.error('SignUp is not available');
        return;
      }
      try {
        await signUp.create({
          phoneNumber: value.phone,
        });
        signUp.preparePhoneNumberVerification();
        router.push('/auth/(create-account)/verify-phone');
      } catch (error) {
        console.error('Error creating sign up:', error);
      }
    },
  });

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
      helpText="We will send you a verification code to this number."
      canProgress={!form.state.isValid}
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
      <View className="min-h-12 flex-1 flex-row gap-6">
        <form.AppField name="phone" children={(field) => <field.PhoneNumber />} />
      </View>
    </BaseOnboardingScreen>
  );
}
