import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import z from 'zod';

import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

export default function InfoScreen() {
  const { isLoaded, signUp } = useSignUp();
  // zod validator for form including 1 field of phone
  const phoneSchema = z.object({
    countryCode: z.string().min(1, { message: 'Country code is required' }),
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits' })
      .max(15, { message: 'Phone number must be at most 15 digits' }),
  });
  const form = useAppForm({
    validators: {
      onChange: phoneSchema,
    },
    onSubmit: async (values) => {
      try {
        await signUp?.create({
          phoneNumber: values.phone,
        });
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
      nextHref="/auth/(create-account)/verify-phone"
      canProgress={!form}
      secondaryActionSlot={
        <Button
          variant="plain"
          onPress={() => {
            router.replace('/auth/(login)');
          }}>
          <Text className="text-sm text-primary">Already have an account?</Text>
        </Button>
      }>
      <View className="min-h-12 flex-1 flex-row gap-6">
        <form.AppField name="countryCode" children={(field) => <field.CountryCode />} />
        <form.AppField name="phone" children={(field) => <field.PhoneNumber />} />
      </View>
    </BaseOnboardingScreen>
  );
}
