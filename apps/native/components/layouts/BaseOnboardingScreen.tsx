import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useClerk } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';
import ChevronLeft from '~/lib/icons/ChevronLeft';
import ChevronRight from '~/lib/icons/ChevronRight';

export const BaseOnboardingScreen = ({
  title,
  description,
  children,
  helpText,
  canProgress = false,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  helpText?: string;
  canProgress?: boolean;
  primaryAction?: {
    onPress: () => void | Promise<void>;
    disabled?: boolean;
    handlesNavigation?: boolean;
  };
  secondaryAction?: {
    onPress: () => void;
    text: string;
  };
}) => {
  const insets = useSafeAreaInsets();
  const cursor = useOnboardingCursor();
  const navigation = useNavigation();

  // Use React Navigation's built-in back handler instead of beforeRemove
  // This avoids the native/JS state mismatch issue
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: cursor.canGoPrevious,
      // Use gesture handler for swipe back instead of intercepting
      gestureEnabled: cursor.canGoPrevious,
    });
  }, [navigation, cursor.canGoPrevious]);

  // Prefetch next step route for better performance
  useFocusEffect(
    useCallback(() => {
      const nextRoute = cursor.getNextStepLink();
      if (nextRoute && cursor.canGoNext) {
        try {
          router.prefetch(nextRoute);
        } catch (error) {
          // Prefetch can fail silently - not critical
          console.log('Prefetch failed for:', nextRoute);
        }
      }
    }, [cursor])
  );

  return (
    <BackgroundGradientView>
      <View className="relative flex-1" style={{ paddingBottom: 0, paddingTop: insets.top + 48 }}>
        {/* Logout button in top right */}

        <KeyboardAwareScrollView
          // bottomOffset={Platform.select({ ios: 8 })}
          bounces={false}
          disableScrollOnKeyboardHide
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-4 ">
          <View className="relative flex-1 justify-center">
            <Text variant="title1">{title}</Text>
            {description && (
              <Text variant="body" className="mt-6 text-text-low">
                {description}
              </Text>
            )}
            <View className="mt-8 gap-4">
              {children}
              {helpText && (
                <View className="items-center pt-2">
                  <Text className="text-text-low" variant="bodySm">
                    {helpText}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>

        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
          }}>
          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            className="absolute bottom-0 right-0 flex-row items-center justify-between gap-4 px-4 pb-2">
            <View className="flex-1 flex-row justify-start">
              {secondaryAction && (
                <Button variant="plain" onPress={secondaryAction.onPress}>
                  <Text className="text-sm text-text-default">{secondaryAction.text}</Text>
                </Button>
              )}
            </View>

            {cursor.canGoPrevious && (
              <Button
                size="icon"
                variant="plain"
                onPress={async () => {
                  // Simply use the cursor navigation which will handle routing
                  await cursor.goToPreviousStep();
                }}>
                <ChevronLeft size={24} className="color-icon-accent" />
              </Button>
            )}
            {/* Continue Button */}
            <Button
              disabled={!canProgress || !cursor.canGoNext}
              size="icon"
              variant="accent"
              onPress={async () => {
                // Execute primary action first (validation, etc.)
                if (primaryAction?.onPress) {
                  await primaryAction.onPress();
                }
                // Only navigate if primary action doesn't handle navigation
                if (cursor.canGoNext && !primaryAction?.handlesNavigation) {
                  await cursor.goToNextStep();
                }
              }}>
              <ChevronRight size={24} className="color-icon-accent" />
            </Button>
          </SafeAreaView>
        </KeyboardStickyView>
      </View>
    </BackgroundGradientView>
  );
};
