import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { View } from 'react-native'

import { HeightPicker, HeightValue } from '~/components/ui/height-picker'
import { Text } from '~/components/ui/text'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export interface HeightValues {
  height: HeightValue
}

export const HeightFormCore = forwardRef<FormHandle, FormProps<HeightValues>>(function HeightFormCore(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const [height, setHeight] = useState<HeightValue>(initialValues.height)

  const isValid = useMemo(() => {
    if (height.feet < 3 || height.feet > 7) return false
    if (height.inches < 0 || height.inches > 11) return false
    const totalInches = height.feet * 12 + height.inches
    if (totalInches < 36 || totalInches > 95) return false
    return true
  }, [height])

  useImperativeHandle(ref, () => ({
    submit: () => onSubmit({ height }),
    isDirty: () =>
      height.feet !== initialValues.height.feet || height.inches !== initialValues.height.inches,
    isValid: () => isValid,
  }))

  useEffect(() => {
    onValidChange?.(isValid)
  }, [isValid, onValidChange])

  const formatHeight = (h: HeightValue) => `${h.feet}'${h.inches}"`

  return (
    <View className="gap-6">
      <HeightPicker value={height} onChange={setHeight} />
      <View className="items-center mt-2">
        <Text className="text-text-low text-lg">{formatHeight(height)}</Text>
      </View>
    </View>
  )
})

