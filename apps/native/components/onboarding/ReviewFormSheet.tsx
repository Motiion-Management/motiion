import React, { useState, useRef } from 'react'
import { View } from 'react-native'

import { Sheet } from '~/components/ui/sheet/sheet'
import { OnboardingFormRef } from '~/components/forms/onboarding/types'
import {
  DisplayNameForm,
  HeightForm,
  EthnicityForm,
  HairColorForm,
  EyeColorForm,
  GenderForm,
  HeadshotsForm,
  SizingForm,
  LocationForm,
  WorkLocationForm,
  RepresentationForm,
  AgencyForm,
  TrainingForm,
  SkillsForm,
  ExperiencesForm,
} from '~/components/forms/onboarding'

type FormType = 
  | 'display-name'
  | 'height'
  | 'ethnicity'
  | 'hair-color'
  | 'eye-color'
  | 'gender'
  | 'headshots'
  | 'sizing'
  | 'location'
  | 'work-location'
  | 'representation'
  | 'agency'
  | 'training'
  | 'skills'
  | 'experiences'

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
  const formRef = useRef<OnboardingFormRef>(null)

  if (!formType || !FORM_CONFIGS[formType]) {
    return null
  }

  const config = FORM_CONFIGS[formType]
  const FormComponent = config.component

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

  return (
    <Sheet
      isOpened={isOpen}
      onIsOpenedChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
      snapPoints={config.snapPoints}
      enableDynamicSizing={false}
      enableContentPanningGesture={false}
    >
      <View className="flex-1">
        <FormComponent
          ref={formRef}
          mode="sheet"
          onComplete={handleFormComplete}
          onCancel={handleClose}
          autoFocus={true}
        />
      </View>
    </Sheet>
  )
}