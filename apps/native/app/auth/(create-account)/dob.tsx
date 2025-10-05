import { useClerk, useSignUp } from '@clerk/clerk-expo';
import { useStore } from '@tanstack/react-store';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseAuthScreen } from '~/components/layouts/BaseAuthScreen';
import { Text } from '~/components/ui/text';

const calculateAge = (dob: Date): number => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const formValidator = z.object({
  dob: z
    .date()
    .refine(
      (date) => {
        const age = calculateAge(date);
        return age >= 13; // Minimum age requirement
      },
      { message: 'You must be at least 13 years old to use this app' }
    )
    .refine(
      (date) => {
        const age = calculateAge(date);
        return age <= 120; // Maximum reasonable age
      },
      { message: 'Please enter a valid date of birth' }
    ),
});

export default function DOBScreen() {
  const { isLoaded, signUp } = useSignUp();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const clerk = useClerk();

  const form = useAppForm({
    defaultValues: {
      dob: new Date(new Date().getFullYear() - 18, 0, 1), // Default to 18 years ago
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
        // Update the sign up with the user's date of birth
        // Update metadata with date of birth
        await signUp.update({
          unsafeMetadata: {
            ...signUp.unsafeMetadata,
            dateOfBirth: value.dob.toISOString(),
          },
        });

        // The signup likely completed during phone verification
        // Access the session directly from Clerk client instead of signUp object
        const sessions = clerk.client?.sessions;
        const activeSession = sessions?.find((s) => s.status === 'active') || sessions?.[0];

        if (activeSession) {
          console.log('🎯 Activating Clerk session');
          await clerk.setActive({ session: activeSession.id });
          console.log('✅ Session activated, continuing to notifications');

          router.push('/auth/(create-account)/enable-notifications');
        } else {
          // Fallback: try reload and check for session in signUp
          await signUp.reload();
          const { createdSessionId } = signUp;

          if (createdSessionId) {
            console.log('🎯 Activating session from signUp object');
            await clerk.setActive({ session: createdSessionId });
            console.log('✅ Session activated, continuing to notifications');

            router.push('/auth/(create-account)/enable-notifications');
          } else {
            setSignupError(
              'Unable to complete signup. Please try again or contact support.'
            );
          }
        }
      } catch (error: any) {
        console.error('Signup error:', error);
        const errorMessage =
          error.errors?.[0]?.message ||
          error.message ||
          'Failed to create account. Please try again.';
        setSignupError(errorMessage);
      } finally {
        setIsCreatingAccount(false);
      }
    },
  });

  const isFormReady = useStore(form.store, (state) => state.canSubmit && !isCreatingAccount);
  const dob = useStore(form.store, (state) => state.values.dob);
  const age = useMemo(() => (dob ? calculateAge(dob as Date) : 0), [dob]);

  const helpText = `By continuing, you are confirming that the above information is accurate and that you are ${age} years of age.`;

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <BaseAuthScreen
      title="What's your date of birth?"
      helpText={helpText}
      canProgress={isFormReady}
      primaryAction={{
        onPress: () => {
          form.handleSubmit();
        },
      }}>
      <ValidationModeForm form={form}>
        <View className="min-h-12 flex-1 gap-6">
          <form.AppField
            name="dob"
            children={(field) => (
              <field.DateInput
                label="Date of Birth"
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={new Date()}
              />
            )}
          />
          {signupError && <Text className="text-sm text-text-error">{signupError}</Text>}
          {isCreatingAccount && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Text className="text-sm text-text-disabled">Completing signup...</Text>
            </View>
          )}
        </View>
      </ValidationModeForm>
    </BaseAuthScreen>
  );
}
