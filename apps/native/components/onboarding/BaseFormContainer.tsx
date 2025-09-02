import React from 'react';
import { View, Platform } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Text } from '~/components/ui/text';

interface BaseFormContainerProps {
  title?: string;
  description?: string;
  helpText?: string;
  children: React.ReactNode;
  scrollEnabled?: boolean;
  footer?: React.ReactNode;
  gradientBackground?: boolean;
  padTop?: boolean;
}

// Minimal, keyboard-safe container with optional title/description and footer slot.
// No action buttons or navigation logic live here.
export function BaseFormContainer({
  title,
  description,
  helpText,
  children,
  scrollEnabled = true,
  footer,
  gradientBackground = true,
  padTop = true,
}: BaseFormContainerProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View className="relative flex-1" style={{ paddingTop: padTop ? insets.top + 48 : 0 }}>
      <KeyboardAwareScrollView
        bounces={false}
        disableScrollOnKeyboardHide
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
        contentContainerClassName="px-4">
        <View className="relative flex-1 justify-center">
          {!!title && <Text variant="title1">{title}</Text>}
          {!!description && (
            <Text variant="body" className="mt-6 text-text-low">
              {description}
            </Text>
          )}
          <View className={`mt-${title || description ? '8' : '0'} gap-4`}>
            {children}
            {!!helpText && (
              <View className="items-center pt-2">
                <Text className="text-text-low" variant="bodySm">
                  {helpText}
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      {footer && (
        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
          }}>
          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            className="absolute bottom-0 right-0 px-4 pb-2">
            {footer}
          </SafeAreaView>
        </KeyboardStickyView>
      )}
    </View>
  );

  if (!gradientBackground) return content;
  return <BackgroundGradientView>{content}</BackgroundGradientView>;
}
