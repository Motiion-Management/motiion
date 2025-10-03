import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import ChevronRight from '~/lib/icons/ChevronRight';
import X from '~/lib/icons/X';

import { OnboardingFormRef } from './types';

interface BaseOnboardingFormProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  helpText?: string;
  canProgress?: boolean;
  mode?: 'fullscreen' | 'sheet';
  onCancel?: () => void;
  onSubmit: () => void | Promise<void>;
  scrollEnabled?: boolean;
  enableGestureHints?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export const BaseOnboardingForm = forwardRef<OnboardingFormRef, BaseOnboardingFormProps>(
  (
    {
      title,
      description,
      children,
      helpText,
      canProgress = false,
      mode = 'fullscreen',
      onCancel,
      onSubmit,
      scrollEnabled = true,
      enableGestureHints = false,
      onValidationChange,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();

    // Gesture feedback animation values
    const gestureScale = useSharedValue(1);
    const gestureOpacity = useSharedValue(1);

    useImperativeHandle(ref, () => ({
      submit: onSubmit,
      reset: () => {
        // TODO: Implement reset functionality if needed
      },
      isValid: () => canProgress,
    }));

    // Notify parent of validation changes
    useEffect(() => {
      onValidationChange?.(canProgress);
    }, [canProgress, onValidationChange]);

    // Gesture hint animation
    const gestureHintStyle = useAnimatedStyle(() => ({
      transform: [{ scale: gestureScale.value }],
      opacity: gestureOpacity.value,
    }));

    // Simple swipe gesture for validation feedback
    const swipeGesture = Gesture.Pan()
      .enabled(enableGestureHints && mode === 'fullscreen')
      .onBegin(() => {
        if (!canProgress) {
          // Shake animation when not valid
          gestureScale.value = withSpring(0.98);
          gestureOpacity.value = withSpring(0.7);
        }
      })
      .onEnd(() => {
        gestureScale.value = withSpring(1);
        gestureOpacity.value = withSpring(1);
      });

    const content = (
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[{ flex: 1 }, gestureHintStyle]} className="relative">
          <View
            className="relative flex-1"
            style={{ paddingBottom: 0, paddingTop: mode === 'fullscreen' ? insets.top + 48 : 16 }}>
            {mode === 'sheet' && onCancel && (
              <View className="absolute right-4 top-4 z-10">
                <Button size="icon" variant="plain" onPress={onCancel}>
                  <X size={24} className="text-icon-default" />
                </Button>
              </View>
            )}

            <KeyboardAwareScrollView
              bounces={false}
              disableScrollOnKeyboardHide
              contentInsetAdjustmentBehavior="never"
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              scrollEnabled={scrollEnabled}
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

            {mode === 'fullscreen' && (
              <KeyboardStickyView
                offset={{
                  closed: 0,
                  opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
                }}>
                <SafeAreaView
                  edges={['bottom', 'left', 'right']}
                  className="absolute bottom-0 right-0 flex-row items-center justify-end gap-4 px-4 pb-2">
                  <Button disabled={!canProgress} size="icon" variant="accent" onPress={onSubmit}>
                    <ChevronRight size={24} className="text-icon-accent" />
                  </Button>
                </SafeAreaView>
              </KeyboardStickyView>
            )}

            {mode === 'sheet' && (
              <View className="border-t border-border-default bg-surface-default px-4 py-4">
                <Button disabled={!canProgress} size="lg" className="w-full" onPress={onSubmit}>
                  <Text>Save</Text>
                </Button>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    );

    if (mode === 'sheet') {
      return content;
    }

    return <BackgroundGradientView>{content}</BackgroundGradientView>;
  }
);

BaseOnboardingForm.displayName = 'BaseOnboardingForm';
