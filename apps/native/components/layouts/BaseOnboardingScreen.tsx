import React, { useCallback, useState, useEffect } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';
import ChevronLeft from '~/lib/icons/ChevronLeft';
import ChevronRight from '~/lib/icons/ChevronRight';
import { perfLog, perfMeasure } from '~/utils/performanceDebug';

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
  const [isNavigating, setIsNavigating] = useState(false);

  // Prefetch next step route for better performance

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
                onPress={() => {
                  perfLog('button:previousPressed', { title });
                  // setIsNavigating(true);
                  cursor.goToPreviousStep();
                  // setTimeout(() => setIsNavigating(false), 300);
                }}
                disabled={isNavigating}>
                <ChevronLeft size={24} className="color-icon-accent" />
              </Button>
            )}
            {/* Continue Button */}
            <Button
              disabled={!canProgress || !cursor.canGoNext || isNavigating}
              size="icon"
              variant="accent"
              onPress={async () => {
                // Show immediate feedback
                setIsNavigating(true);

                try {
                  // Execute primary action first (validation, etc.)
                  if (primaryAction?.onPress) {
                    primaryAction.onPress();
                  }
                  // Only navigate if primary action doesn't handle navigation
                  if (cursor.canGoNext && !primaryAction?.handlesNavigation) {
                    cursor.goToNextStep();
                  }
                } finally {
                  perfMeasure('button:handleNext');
                  // Reset state after a brief delay to prevent flicker
                  // setTimeout(() => setIsNavigating(false), 300);
                }
              }}>
              {isNavigating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ChevronRight size={24} className="color-icon-accent" />
              )}
            </Button>
          </SafeAreaView>
        </KeyboardStickyView>
      </View>
    </BackgroundGradientView>
  );
};
