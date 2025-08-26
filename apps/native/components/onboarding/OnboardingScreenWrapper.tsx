import React, { useCallback, useMemo, useRef } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import ChevronLeft from '~/lib/icons/ChevronLeft'
import ChevronRight from '~/lib/icons/ChevronRight'
import { GroupProgressBar } from './GroupProgressBar'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import type { OnboardingFormRef } from '~/components/forms/onboarding/types'

interface OnboardingScreenWrapperProps {
  children: React.ReactNode
  formRef?: React.RefObject<OnboardingFormRef>
  canSubmit?: boolean
  onSubmitOverride?: () => void | Promise<void>
  showProgress?: boolean
  className?: string
}

// Fullscreen wrapper responsible for progress, breadcrumb and actions.
// It does not render fields; it orchestrates navigation & form submission.
export function OnboardingScreenWrapper({
  children,
  formRef,
  canSubmit,
  onSubmitOverride,
  showProgress = true,
  className,
}: OnboardingScreenWrapperProps) {
  const onboarding = useOnboardingGroupFlow()
  const internalRef = useRef<OnboardingFormRef>(null)
  const activeFormRef = formRef ?? internalRef

  const isValid = useMemo(() => {
    if (typeof canSubmit === 'boolean') return canSubmit
    return activeFormRef.current?.isValid?.() ?? false
  }, [activeFormRef.current, canSubmit])

  const handleBack = useCallback(() => {
    onboarding.navigateToPreviousStep()
  }, [onboarding])

  const handleContinue = useCallback(() => {
    if (onSubmitOverride) return onSubmitOverride()
    return activeFormRef.current?.submit?.()
  }, [activeFormRef, onSubmitOverride])

  return (
    <View className={`flex-1 ${className ?? ''}`}>
      {showProgress && (
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View className="px-4 py-3">
            <GroupProgressBar />
          </View>
        </SafeAreaView>
      )}

      <View className="flex-1">{children}</View>

      <SafeAreaView edges={['bottom', 'left', 'right']}>
        <View className="border-t border-border-default bg-surface-default px-4 py-3 flex-row items-center justify-between">
          <Button variant="plain" onPress={handleBack}>
            <ChevronLeft size={20} className="color-icon-default" />
            <Text className="ml-1">Back</Text>
          </Button>
          <Button variant="accent" disabled={!isValid} onPress={handleContinue}>
            <Text className="mr-1">Continue</Text>
            <ChevronRight size={20} className="color-icon-accent" />
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
}
