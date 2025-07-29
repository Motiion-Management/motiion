import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useClerk } from '@clerk/clerk-expo';
import { router } from 'expo-router';
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
import { trackScreen, perfLog, perfMark, perfMeasure } from '~/utils/performanceDebug';

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
  const [isNavigating, setIsNavigating] = useState(false);

  // Track screen mount
  useEffect(() => {
    const screenName = `BaseOnboardingScreen:${title}`;
    trackScreen.mountStart(screenName);
    perfLog('screen:mount', { title, canProgress, hasChildren: !!children });

    return () => {
      trackScreen.mountComplete(screenName, {
        title,
        hadNavigation: !!navigation,
        cursorLoaded: !cursor.isLoading,
      });
    };
  }, [title]);

  // Use React Navigation's built-in back handler instead of beforeRemove
  // This avoids the native/JS state mismatch issue
  // React.useLayoutEffect(() => {
  //   // Check if navigation is ready and not a placeholder
  //   if (navigation && navigation.setOptions && !cursor.isLoading) {
  //     // Additional check to ensure we're not on a placeholder screen
  //     const canSetOptions = navigation.getState && navigation.getState()?.index !== undefined;
  //
  //     if (canSetOptions) {
  //       try {
  //         navigation.setOptions({
  //           headerBackVisible: cursor.canGoPrevious,
  //           // Use gesture handler for swipe back instead of intercepting
  //           gestureEnabled: cursor.canGoPrevious,
  //         });
  //       } catch (error) {
  //         // Silently ignore - this happens during navigation transitions
  //         // The options will be set once navigation stabilizes
  //       }
  //     }
  //   }
  // }, [navigation, cursor.canGoPrevious, cursor.isLoading]);

  // Prefetch next step route for better performance
  useFocusEffect(
    useCallback(() => {
      perfLog('screen:focus', { title, cursorLoading: cursor.isLoading });

      // Only prefetch when cursor is loaded and we have a valid next route
      if (!cursor.isLoading) {
        const nextRoute = cursor.getNextStepLink();
        if (nextRoute) {
          perfMark('prefetch:next');
          try {
            router.prefetch(nextRoute);
            perfMeasure('prefetch:next', undefined, { route: nextRoute });
          } catch (error) {
            // Prefetch can fail silently - not critical
            perfMeasure('prefetch:next', undefined, { route: nextRoute, failed: true });
          }
        }
        const prevRoute = cursor.getPreviousStepLink();

        if (prevRoute) {
          perfMark('prefetch:prev');
          try {
            router.prefetch(prevRoute);
            perfMeasure('prefetch:prev', undefined, { route: prevRoute });
          } catch (error) {
            // Prefetch can fail silently - not critical
            perfMeasure('prefetch:prev', undefined, { route: prevRoute, failed: true });
          }
        }
      }
    }, [cursor.canGoNext, cursor.isLoading, cursor.getNextStepLink, cursor.canGoPrevious, title])
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
