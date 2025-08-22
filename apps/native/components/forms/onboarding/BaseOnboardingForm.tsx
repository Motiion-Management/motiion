import React, { forwardRef, useImperativeHandle } from 'react'
import { View, Platform } from 'react-native'
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { BackgroundGradientView } from '~/components/ui/background-gradient-view'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import ChevronRight from '~/lib/icons/ChevronRight'
import X from '~/lib/icons/X'

import { OnboardingFormRef } from './types'

interface BaseOnboardingFormProps {
  title: string
  description?: string
  children: React.ReactNode
  helpText?: string
  canProgress?: boolean
  mode?: 'fullscreen' | 'sheet'
  onCancel?: () => void
  onSubmit: () => void | Promise<void>
  scrollEnabled?: boolean
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
    },
    ref
  ) => {
    const insets = useSafeAreaInsets()

    useImperativeHandle(ref, () => ({
      submit: onSubmit,
      reset: () => {
        // TODO: Implement reset functionality if needed
      },
      isValid: () => canProgress,
    }))

    const content = (
      <View className="relative flex-1" style={{ paddingBottom: 0, paddingTop: mode === 'fullscreen' ? insets.top + 48 : 16 }}>
        {mode === 'sheet' && onCancel && (
          <View className="absolute right-4 top-4 z-10">
            <Button size="icon" variant="plain" onPress={onCancel}>
              <X size={24} className="color-icon-default" />
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
          contentContainerClassName="px-4">
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
              <Button
                disabled={!canProgress}
                size="icon"
                variant="accent"
                onPress={onSubmit}>
                <ChevronRight size={24} className="color-icon-accent" />
              </Button>
            </SafeAreaView>
          </KeyboardStickyView>
        )}

        {mode === 'sheet' && (
          <View className="border-t border-border-default bg-surface-default px-4 py-4">
            <Button
              disabled={!canProgress}
              size="lg"
              className="w-full"
              onPress={onSubmit}>
              <Text>Save</Text>
            </Button>
          </View>
        )}
      </View>
    )

    if (mode === 'sheet') {
      return content
    }

    return <BackgroundGradientView>{content}</BackgroundGradientView>
  }
)

BaseOnboardingForm.displayName = 'BaseOnboardingForm'