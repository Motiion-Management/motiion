import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import { Sheet } from '~/components/ui/sheet/sheet'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import type { FormHandle } from '~/components/forms/onboarding/contracts'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'

type FormType = keyof typeof STEP_REGISTRY

interface ReviewFormSheetProps {
  isOpen: boolean
  onClose: () => void
  formType: FormType | null
  onFormComplete?: (data: any) => void
}

const FORM_CONFIGS = {
  'display-name': {
    component: DisplayNameForm,
    snapPoints: ['60%'],
  },
  'height': {
    component: HeightForm,
    snapPoints: ['70%'],
  },
  'ethnicity': {
    component: EthnicityForm,
    snapPoints: ['80%'],
  },
  'hair-color': {
    component: HairColorForm,
    snapPoints: ['70%'],
  },
  'eye-color': {
    component: EyeColorForm,
    snapPoints: ['70%'],
  },
  'gender': {
    component: GenderForm,
    snapPoints: ['60%'],
  },
  'headshots': {
    component: HeadshotsForm,
    snapPoints: ['90%'],
  },
  'sizing': {
    component: SizingForm,
    snapPoints: ['80%'],
  },
  'location': {
    component: LocationForm,
    snapPoints: ['70%'],
  },
  'work-location': {
    component: WorkLocationForm,
    snapPoints: ['80%'],
  },
  'representation': {
    component: RepresentationForm,
    snapPoints: ['70%'],
  },
  'agency': {
    component: AgencyForm,
    snapPoints: ['80%'],
  },
  'training': {
    component: TrainingForm,
    snapPoints: ['90%'],
  },
  'skills': {
    component: SkillsForm,
    snapPoints: ['80%'],
  },
  'experiences': {
    component: ExperiencesForm,
    snapPoints: ['90%'],
  },
} as const

export function ReviewFormSheet({ 
  isOpen, 
  onClose, 
  formType, 
  onFormComplete 
}: ReviewFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)
  const formRef = useRef<FormHandle>(null)
  const { data, isLoading } = useOnboardingData()

  const def = formType ? STEP_REGISTRY[formType] : undefined
  const FormComponent = def?.Component as any

  const handleFormComplete = async (data: any) => {
    try {
      setIsSubmitting(true)
      await onFormComplete?.(data)
      onClose()
    } catch (error) {
      console.error('Error completing form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!formType || !def) return null

  const [initialValues, setInitialValues] = useState<any | null>(null)

  useEffect(() => {
    if (isLoading || !def) return
    Promise.resolve(def.getInitialValues(data)).then(setInitialValues)
  }, [data, isLoading, def])

  if (isLoading || !initialValues) return null

  return (
    <Sheet
      isOpened={isOpen}
      onIsOpenedChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
      snapPoints={['80%']}
      enableDynamicSizing={false}
      enableContentPanningGesture={false}
    >
      <View className="flex-1">
        <FormComponent
          ref={formRef}
          initialValues={initialValues}
          onSubmit={handleFormComplete}
          onValidChange={setCanSubmit}
        />
        <View className="border-t border-border-default bg-surface-default px-4 py-4">
          <Button disabled={!canSubmit || isSubmitting} size="lg" className="w-full" onPress={() => formRef.current?.submit()}>
            <Text>Save</Text>
          </Button>
        </View>
      </View>
    </Sheet>
  )
}
