import React, { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'

import type { FormHandle } from '~/components/forms/onboarding/contracts'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import X from '~/lib/icons/X'

export default function ReviewEditModal() {
  const { step } = useLocalSearchParams<{ step: string }>()
  const def = step ? (STEP_REGISTRY as any)[step] : undefined

  const formRef = useRef<FormHandle>(null)
  const { data, isLoading } = useOnboardingData()
  const [initialValues, setInitialValues] = useState<any | null>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!def || isLoading) return
    Promise.resolve(def.getInitialValues(data)).then(setInitialValues)
  }, [def, data, isLoading])

  const handleClose = () => {
    if (!isSubmitting) router.back()
  }

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true)
      await Promise.resolve(def?.save?.(values))
      router.back()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!def) return null
  const FormComponent = def.Component as any

  return (
    <View className="flex-1 bg-surface-default">
      {/* Close */}
      <SafeAreaView edges={['top', 'left', 'right']}>
        <View className="absolute right-2 top-2 z-10">
          <Button size="icon" variant="plain" onPress={handleClose}>
            <X size={24} className="color-icon-default" />
          </Button>
        </View>
      </SafeAreaView>

      <View className="flex-1 px-4 pt-12">
        {!isLoading && initialValues && (
          <FormComponent
            ref={formRef}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onValidChange={setCanSubmit}
          />
        )}
      </View>

      <SafeAreaView edges={['bottom', 'left', 'right']}>
        <View className="border-t border-border-default bg-surface-default px-4 py-4">
          <Button disabled={!canSubmit || isSubmitting} size="lg" className="w-full" onPress={() => formRef.current?.submit()}>
            <Text>Save</Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
}

