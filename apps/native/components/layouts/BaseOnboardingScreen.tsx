import React, { useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import ChevronLeft from '~/lib/icons/ChevronLeft';
import ChevronRight from '~/lib/icons/ChevronRight';
import { perfLog } from '~/utils/performanceDebug';

export const BaseOnboardingScreen = ({
  title,
  description,
  children,
  helpText,
  canProgress = false,
  primaryAction,
  secondaryAction,
  bottomActionSlot,
  scrollEnabled = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  helpText?: string;
  canProgress?: boolean;
  scrollEnabled?: boolean;
  primaryAction?: {
    onPress: () => void | Promise<void>;
    disabled?: boolean;
    handlesNavigation?: boolean;
  };
  secondaryAction?: {
    onPress: () => void;
    text: string;
  };
  bottomActionSlot?: React.ReactNode;
}) => {
  const insets = useSafeAreaInsets();
  const onboardingFlow = useOnboardingGroupFlow();
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <BackgroundGradientView>
      <View className="relative flex-1" style={{ paddingBottom: 0, paddingTop: insets.top + 48 }}>
        {/* Logout button in top right */}

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

        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
          }}>
          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            className="absolute bottom-0 right-0 flex-row items-center justify-between gap-4 px-4 pb-2">
            {bottomActionSlot || (
              <>
                <View className="flex-1 flex-row justify-start">
                  {secondaryAction && (
                    <Button variant="tertiary" onPress={secondaryAction.onPress}>
                      <Text className="text-sm text-text-default">{secondaryAction.text}</Text>
                    </Button>
                  )}
                </View>

                {onboardingFlow.canNavigatePrevious && (
                  <Button
                    size="icon"
                    variant="tertiary"
                    onPress={() => {
                      perfLog('button:previousPressed', { title });
                      setIsNavigating(true);
                      onboardingFlow.navigateToPreviousStep();
                      setTimeout(() => setIsNavigating(false), 300);
                    }}
                    disabled={onboardingFlow.isLoading}>
                    <ChevronLeft size={20} className="text-icon-accent" />
                  </Button>
                )}
                {/* Continue Button */}
                <Button
                  disabled={!canProgress || !onboardingFlow.canNavigateNext}
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
                      if (onboardingFlow.canNavigateNext && !primaryAction?.handlesNavigation) {
                        onboardingFlow.navigateToNextStep();
                      }
                    } finally {
                      // Reset state after a brief delay to prevent flicker
                      setTimeout(() => setIsNavigating(false), 300);
                    }
                  }}>
                  {isNavigating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ChevronRight size={20} className="text-icon-accent" />
                  )}
                </Button>
              </>
            )}
          </SafeAreaView>
        </KeyboardStickyView>
      </View>
    </BackgroundGradientView>
  );
};
