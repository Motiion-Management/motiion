import { router } from 'expo-router';
import * as React from 'react';
import { Platform, View } from 'react-native';
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
  const insets = useSafeAreaInsets();
  const [focusedTextField, setFocusedTextField] = React.useState<'first-name' | 'last-name' | null>(
    null
  );
  return (
    <View className="flex-1 bg-transparent" style={{ paddingBottom: insets.bottom }}>
      <KeyboardAwareScrollView
        bottomOffset={Platform.select({ ios: 8 })}
        bounces={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="ios:pt-4 px-4 ">
        <Text variant="title1" className="">
          What's your phone number?
        </Text>
        <View className="ios:pt-4 pt-6">
          <Form className="gap-2">
            <FormSection className="ios:bg-background">
              <FormItem>
                <TextField
                  placeholder={Platform.select({ ios: 'First Name', default: '' })}
                  label={Platform.select({ ios: undefined, default: 'First Name' })}
                  onSubmitEditing={() => KeyboardController.setFocusTo('next')}
                  blurOnSubmit={false}
                  autoFocus
                  onFocus={() => setFocusedTextField('first-name')}
                  onBlur={() => setFocusedTextField(null)}
                  textContentType="name"
                  returnKeyType="next"
                />
              </FormItem>
              <FormItem>
                <TextField
                  placeholder={Platform.select({ ios: 'Last Name', default: '' })}
                  label={Platform.select({ ios: undefined, default: 'Last Name' })}
                  onFocus={() => setFocusedTextField('last-name')}
                  onBlur={() => setFocusedTextField(null)}
                  textContentType="givenName"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    router.push('/auth/(create-account)/credentials');
                  }}
                />
              </FormItem>
            </FormSection>
          </Form>
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: Platform.select({ ios: insets.bottom + 30, default: insets.bottom }),
        }}>
        {Platform.OS === 'ios' ? (
          <View className=" px-12 py-4">
            <Button
              size="lg"
              onPress={() => {
                router.push('/auth/(create-account)/credentials');
              }}>
              <Text>Continue</Text>
            </Button>
          </View>
        ) : (
          <View className="flex-row justify-between py-4 pl-6 pr-8">
            <Button
              variant="plain"
              className="px-2"
              onPress={() => {
                router.replace('/auth/(login)');
              }}>
              <Text className="text-sm text-primary">Already have an account?</Text>
            </Button>
            <Button
              onPress={() => {
                if (focusedTextField === 'first-name') {
                  KeyboardController.setFocusTo('next');
                  return;
                }
                KeyboardController.dismiss();
                router.push('/auth/(create-account)/credentials');
              }}>
              <Text className="text-sm">Next</Text>
            </Button>
          </View>
        )}
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
