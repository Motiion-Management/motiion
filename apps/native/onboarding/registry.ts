import type { ComponentType } from 'react'
import type { FormProps } from '~/components/forms/onboarding/contracts'
import type { OnboardingData } from '~/hooks/useOnboardingData'
import { DisplayNameFormCore, displayNameSchema } from '~/components/forms/onboarding/DisplayNameFormCore'
import { HeightFormCore } from '~/components/forms/onboarding/HeightFormCore'
import { EthnicityFormCore, ethnicitySchema } from '~/components/forms/onboarding/EthnicityFormCore'
import { HairColorFormCore, hairColorSchema } from '~/components/forms/onboarding/HairColorFormCore'
import { EyeColorFormCore, eyeColorSchema } from '~/components/forms/onboarding/EyeColorFormCore'
import { GenderFormCore, genderSchema } from '~/components/forms/onboarding/GenderFormCore'
import { selectDisplayName, selectHeight, selectEthnicity, selectHairColor, selectEyeColor, selectGender } from './selectors'

// Step definition used by the dynamic review modal and wrappers.
export interface StepDef<T = any> {
  key: string
  title: string
  description?: string
  // The form component implementing the unified contract.
  Component: ComponentType<FormProps<T>>
  // Optional validation schema (e.g., Zod) exposed for reuse.
  schema?: unknown
  // Read initial values from the source of truth (store/server).
  getInitialValues: (data: OnboardingData) => T | Promise<T>
  // Persist values; may perform optimistic update externally.
  save: (values: T) => void | Promise<void>
}

export const STEP_REGISTRY = {
  'display-name': {
    key: 'display-name',
    title: 'Display name',
    description: 'Choose how your name appears.',
    Component: DisplayNameFormCore as unknown as ComponentType<FormProps<any>>, // keep loose until all forms migrate
    schema: displayNameSchema,
    getInitialValues: (data: OnboardingData) => ({ displayName: selectDisplayName(data) }),
    save: async (_values: any) => {
      // Route/screen should provide the actual save via onSubmit for now
    },
  },
  'height': {
    key: 'height',
    title: 'How tall are you?',
    description: 'Select height',
    Component: HeightFormCore as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (data: OnboardingData) => ({ height: selectHeight(data) }),
    save: async (_values: any) => {},
  },
  'ethnicity': {
    key: 'ethnicity',
    title: "What's your ethnicity?",
    description: 'Select all that apply',
    Component: EthnicityFormCore as unknown as ComponentType<FormProps<any>>,
    schema: ethnicitySchema,
    getInitialValues: (data: OnboardingData) => ({ ethnicity: selectEthnicity(data) }),
    save: async (_values: any) => {},
  },
  'hair-color': {
    key: 'hair-color',
    title: 'What color is your hair?',
    description: 'Select one',
    Component: HairColorFormCore as unknown as ComponentType<FormProps<any>>,
    schema: hairColorSchema,
    getInitialValues: (data: OnboardingData) => ({ hairColor: selectHairColor(data) }),
    save: async (_values: any) => {},
  },
  'eye-color': {
    key: 'eye-color',
    title: 'What color are your eyes?',
    description: 'Select one',
    Component: EyeColorFormCore as unknown as ComponentType<FormProps<any>>,
    schema: eyeColorSchema,
    getInitialValues: (data: OnboardingData) => ({ eyeColor: selectEyeColor(data) }),
    save: async (_values: any) => {},
  },
  'gender': {
    key: 'gender',
    title: 'What best describes your gender?',
    description: 'Select one',
    Component: GenderFormCore as unknown as ComponentType<FormProps<any>>,
    schema: genderSchema,
    getInitialValues: (data: OnboardingData) => ({ gender: selectGender(data) }),
    save: async (_values: any) => {},
  },
} as const

export type StepKey = keyof typeof STEP_REGISTRY
