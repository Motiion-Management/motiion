import type { ComponentType } from 'react'
import type { FormProps } from '~/components/forms/onboarding/contracts'
import type { OnboardingData } from '~/hooks/useOnboardingData'
import { DisplayNameForm, displayNameSchema } from '~/components/forms/onboarding/DisplayNameForm'
import { HeightForm } from '~/components/forms/onboarding/HeightForm'
import { EthnicityForm, ethnicitySchema } from '~/components/forms/onboarding/EthnicityForm'
import { HairColorForm, hairColorSchema } from '~/components/forms/onboarding/HairColorForm'
import { EyeColorForm, eyeColorSchema } from '~/components/forms/onboarding/EyeColorForm'
import { GenderForm, genderSchema } from '~/components/forms/onboarding/GenderForm'
import { LocationForm } from '~/components/forms/onboarding/LocationForm'
import { WorkLocationForm } from '~/components/forms/onboarding/WorkLocationForm'
import { HeadshotsForm } from '~/components/forms/onboarding/HeadshotsForm'
import { SkillsForm, skillsSchema } from '~/components/forms/onboarding/SkillsForm'
import { RepresentationForm, representationSchema } from '~/components/forms/onboarding/RepresentationForm'
import { AgencyForm, agencySchema } from '~/components/forms/onboarding/AgencyForm'
import { selectDisplayName, selectHeight, selectEthnicity, selectHairColor, selectEyeColor, selectGender, selectPrimaryPlaceKitLocation, selectWorkLocations, selectSkills, selectRepresentationStatus, selectAgencyId } from './selectors'

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
    Component: DisplayNameForm as unknown as ComponentType<FormProps<any>>, // keep loose until all forms migrate
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
    Component: HeightForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (data: OnboardingData) => ({ height: selectHeight(data) }),
    save: async (_values: any) => {},
  },
  'ethnicity': {
    key: 'ethnicity',
    title: "What's your ethnicity?",
    description: 'Select all that apply',
    Component: EthnicityForm as unknown as ComponentType<FormProps<any>>,
    schema: ethnicitySchema,
    getInitialValues: (data: OnboardingData) => ({ ethnicity: selectEthnicity(data) }),
    save: async (_values: any) => {},
  },
  'hair-color': {
    key: 'hair-color',
    title: 'What color is your hair?',
    description: 'Select one',
    Component: HairColorForm as unknown as ComponentType<FormProps<any>>,
    schema: hairColorSchema,
    getInitialValues: (data: OnboardingData) => ({ hairColor: selectHairColor(data) }),
    save: async (_values: any) => {},
  },
  'eye-color': {
    key: 'eye-color',
    title: 'What color are your eyes?',
    description: 'Select one',
    Component: EyeColorForm as unknown as ComponentType<FormProps<any>>,
    schema: eyeColorSchema,
    getInitialValues: (data: OnboardingData) => ({ eyeColor: selectEyeColor(data) }),
    save: async (_values: any) => {},
  },
  'gender': {
    key: 'gender',
    title: 'What best describes your gender?',
    description: 'Select one',
    Component: GenderForm as unknown as ComponentType<FormProps<any>>,
    schema: genderSchema,
    getInitialValues: (data: OnboardingData) => ({ gender: selectGender(data) }),
    save: async (_values: any) => {},
  },
  'location': {
    key: 'location',
    title: 'Where are you located?',
    description: '',
    Component: LocationForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (data: OnboardingData) => ({ primaryLocation: selectPrimaryPlaceKitLocation(data) }),
    save: async (_values: any) => {},
  },
  'work-location': {
    key: 'work-location',
    title: 'Where can you work as a local?',
    description: '',
    Component: WorkLocationForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (data: OnboardingData) => ({ locations: [selectPrimaryPlaceKitLocation(data), ...selectWorkLocations(data)] }),
    save: async (_values: any) => {},
  },
  'headshots': {
    key: 'headshots',
    title: 'Headshots',
    description: 'Upload your professional headshots to showcase your look.',
    Component: HeadshotsForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (_data: OnboardingData) => ({}),
    save: async (_values: any) => {},
  },
  'skills': {
    key: 'skills',
    title: 'Add your skills',
    description: 'What genre and special skills are you proficient in?',
    Component: SkillsForm as unknown as ComponentType<FormProps<any>>,
    schema: skillsSchema,
    getInitialValues: (data: OnboardingData) => selectSkills(data),
    save: async (_values: any) => {},
  },
  'representation': {
    key: 'representation',
    title: 'Are you represented by an agent?',
    description: 'Select one',
    Component: RepresentationForm as unknown as ComponentType<FormProps<any>>,
    schema: representationSchema,
    getInitialValues: (data: OnboardingData) => selectRepresentationStatus(data),
    save: async (_values: any) => {},
  },
  'agency': {
    key: 'agency',
    title: 'Select Agency',
    description: 'Search and select your representation agency',
    Component: AgencyForm as unknown as ComponentType<FormProps<any>>,
    schema: agencySchema,
    getInitialValues: (data: OnboardingData) => selectAgencyId(data),
    save: async (_values: any) => {},
  },
} as const

export type StepKey = keyof typeof STEP_REGISTRY
