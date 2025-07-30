import React from 'react'
import { Platform, View } from 'react-native'
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackgroundGradientView } from '~/components/ui/background-gradient-view'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { useOnboardingFlowV3 } from '~/hooks/useOnboardingFlowV3'
import ChevronLeft from '~/lib/icons/ChevronLeft'
import ChevronRight from '~/lib/icons/ChevronRight'
import { Loader2 } from 'lucide-react-native'

interface BaseOnboardingScreenV3Props {
  children: React.ReactNode
  helpText?: string
  // Optional overrides for UI
  title?: string
  description?: string
  // Show/hide navigation buttons
  showNavigation?: boolean
  showProgress?: boolean
}

/**
 * Simplified base onboarding screen for V3 architecture
 * - No complex navigation logic
 * - Relies on pre-calculated flow data
 * - Auto-progression handled by forms
 */
export function BaseOnboardingScreenV3({
  children,
  helpText,
  title: titleOverride,
  description: descriptionOverride,
  showNavigation = true,
  showProgress = true
}: BaseOnboardingScreenV3Props) {
  const insets = useSafeAreaInsets()
  const {
    currentStep,
    canGoPrevious,
    canGoNext,
    navigatePrevious,
    navigateNext,
    progress,
    currentIndex,
    totalSteps,
    isLoading
  } = useOnboardingFlowV3()
  
  // Use step data or overrides
  const title = titleOverride || currentStep?.title || 'Loading...'
  const description = descriptionOverride || currentStep?.description
  
  if (isLoading) {
    return (
      <BackgroundGradientView>
        <View className="flex-1 items-center justify-center">
          <Loader2 size={48} className="animate-spin text-muted-foreground" />
        </View>
      </BackgroundGradientView>
    )
  }
  
  return (
    <BackgroundGradientView>
      <View className="relative flex-1" style={{ paddingTop: insets.top + 48 }}>
        {/* Progress bar */}
        {showProgress && (
          <View className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <View 
              className="h-full bg-primary" 
              style={{ width: `${progress}%` }}
            />
          </View>
        )}
        
        {/* Content */}
        <KeyboardAwareScrollView
          bounces={false}
          disableScrollOnKeyboardHide
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-4"
        >
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
        
        {/* Navigation (only shown when auto-submit is disabled) */}
        {showNavigation && !currentStep?.autoSubmit && (
          <KeyboardStickyView
            offset={{
              closed: 0,
              opened: Platform.select({ ios: insets.bottom, default: insets.bottom })
            }}
          >
            <SafeAreaView
              edges={['bottom', 'left', 'right']}
              className="absolute bottom-0 right-0 flex-row items-center justify-between gap-4 px-4 pb-2"
            >
              {/* Step counter */}
              <View className="flex-1 flex-row justify-start">
                <Text variant="bodySm" className="text-muted-foreground">
                  Step {currentIndex + 1} of {totalSteps}
                </Text>
              </View>
              
              {/* Previous button */}
              {canGoPrevious && (
                <Button
                  size="icon"
                  variant="plain"
                  onPress={navigatePrevious}
                >
                  <ChevronLeft size={24} className="color-icon-accent" />
                </Button>
              )}
              
              {/* Next button */}
              {canGoNext && (
                <Button
                  size="icon"
                  variant="accent"
                  onPress={navigateNext}
                >
                  <ChevronRight size={24} className="color-icon-accent" />
                </Button>
              )}
            </SafeAreaView>
          </KeyboardStickyView>
        )}
      </View>
    </BackgroundGradientView>
  )
}

/**
 * Loading screen component for onboarding
 */
export function OnboardingLoadingScreen() {
  return (
    <BackgroundGradientView>
      <View className="flex-1 items-center justify-center">
        <Loader2 size={48} className="animate-spin text-muted-foreground" />
        <Text variant="body" className="mt-4 text-muted-foreground">
          Loading your onboarding experience...
        </Text>
      </View>
    </BackgroundGradientView>
  )
}

/**
 * Error screen component for onboarding
 */
export function OnboardingErrorScreen({ 
  error,
  onRetry 
}: { 
  error?: string
  onRetry?: () => void 
}) {
  return (
    <BackgroundGradientView>
      <View className="flex-1 items-center justify-center px-4">
        <Text variant="title2" className="text-destructive">
          Something went wrong
        </Text>
        <Text variant="body" className="mt-4 text-center text-muted-foreground">
          {error || 'We encountered an error loading your onboarding flow. Please try again.'}
        </Text>
        {onRetry && (
          <Button variant="accent" className="mt-8" onPress={onRetry}>
            <Text>Try Again</Text>
          </Button>
        )}
      </View>
    </BackgroundGradientView>
  )
}