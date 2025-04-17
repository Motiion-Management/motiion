import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardController,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '~/components/nativewindui/Button';
import { Form, FormItem, FormSection } from '~/components/nativewindui/Form';
import { Text } from '~/components/nativewindui/Text';
import { TextField } from '~/components/nativewindui/TextField';

export default function InfoScreen() {
  const { isLoaded, signUp } = useSignUp();
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent" style={{ paddingBottom: insets.bottom }}>
      <KeyboardAwareScrollView
        bottomOffset={Platform.select({ ios: 8 })}
        bounces={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pt-4 px-4 ">
        <Text variant="title1" className="">
          What's your phone number?
        </Text>
        <View className="ios:pt-4 pt-6">
          <TextField
            placeholder="XXX XXX XXXX"
            label="Phone Number"
            // onSubmitEditing={() => KeyboardController.setFocusTo('next')}
            blurOnSubmit
            autoFocus
            textContentType="telephoneNumber"
            returnKeyType="done"
          />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: Platform.select({ ios: insets.bottom + 30, default: insets.bottom }),
        }}>
        <View className=" px-12 py-4">
          <Button
            size="lg"
            onPress={() => {
              router.push('/auth/(create-account)/credentials');
            }}>
            <Text>Continue</Text>
          </Button>
        </View>
      </KeyboardStickyView>
      {Platform.OS === 'ios' && (
        <Button
          variant="plain"
          onPress={() => {
            router.replace('/auth/(login)');
          }}>
          <Text className="text-sm text-primary">Already have an account?</Text>
        </Button>
      )}
    </View>
  );
}
