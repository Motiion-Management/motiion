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
import { SizingForm } from '~/components/forms/onboarding/SizingForm'
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
  helpText?: string
  // The form component implementing the unified contract.
  Component: ComponentType<FormProps<T>>
  // Optional validation schema (e.g., Zod) exposed for reuse.
  schema?: unknown
  // Read initial values from the source of truth (store).
  // Keep this synchronous to avoid modal open delays.
  getInitialValues: (data: OnboardingData) => T
  // Persist values; route provides mutations via ctx to avoid hooks here.
  save?: (values: T, ctx: SaveContext) => void | Promise<void>
}

export interface SaveContext {
  data: OnboardingData
  updateMyUser: (args: any) => Promise<any>
  patchUserAttributes: (args: any) => Promise<any>
  updateMyResume: (args: any) => Promise<any>
  addMyRepresentation: (args: any) => Promise<any>
}

export const STEP_REGISTRY = {
  'display-name': {
    key: 'display-name',
    title: 'Display name',
    description: 'Choose how your name appears.',
    helpText:
      'This will be the name displayed on your public profile. If you go by another name professionally, enter it here.',
    Component: DisplayNameForm as unknown as ComponentType<FormProps<any>>, // keep loose until all forms migrate
    schema: displayNameSchema,
    getInitialValues: (data: OnboardingData) => ({ displayName: selectDisplayName(data) }),
    save: async (values: any, ctx) => {
      await ctx.updateMyUser({ displayName: values.displayName.trim() })
    },
  },
  'height': {
    key: 'height',
    title: 'How tall are you?',
    description: 'Select height',
    helpText: 'Use feet and inches. Be accurate to help casting directors.',
    Component: HeightForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (data: OnboardingData) => ({ height: selectHeight(data) }),
    save: async (values: any, ctx) => {
      await ctx.patchUserAttributes({ attributes: { height: values.height } })
    },
  },
  'ethnicity': {
    key: 'ethnicity',
    title: "What's your ethnicity?",
    description: 'Select all that apply',
    helpText: 'Select all ethnicities that best represent you.',
    Component: EthnicityForm as unknown as ComponentType<FormProps<any>>,
    schema: ethnicitySchema,
    getInitialValues: (data: OnboardingData) => ({ ethnicity: selectEthnicity(data) }),
    save: async (values: any, ctx) => {
      await ctx.patchUserAttributes({ attributes: { ethnicity: values.ethnicity } })
    },
  },
  'hair-color': {
    key: 'hair-color',
    title: 'What color is your hair?',
    description: 'Select one',
    helpText: 'Choose the hair color that best matches your current appearance.',
    Component: HairColorForm as unknown as ComponentType<FormProps<any>>,
    schema: hairColorSchema,
    getInitialValues: (data: OnboardingData) => ({ hairColor: selectHairColor(data) }),
    save: async (values: any, ctx) => {
      await ctx.patchUserAttributes({ attributes: { hairColor: values.hairColor } })
    },
  },
  'eye-color': {
    key: 'eye-color',
    title: 'What color are your eyes?',
    description: 'Select one',
    helpText: 'Pick the eye color that appears most accurate in person.',
    Component: EyeColorForm as unknown as ComponentType<FormProps<any>>,
    schema: eyeColorSchema,
    getInitialValues: (data: OnboardingData) => ({ eyeColor: selectEyeColor(data) }),
    save: async (values: any, ctx) => {
      await ctx.patchUserAttributes({ attributes: { eyeColor: values.eyeColor } })
    },
  },
  'gender': {
    key: 'gender',
    title: 'What best describes your gender?',
    description: 'Select one',
    helpText: 'Choose the option that best describes you.',
    Component: GenderForm as unknown as ComponentType<FormProps<any>>,
    schema: genderSchema,
    getInitialValues: (data: OnboardingData) => ({ gender: selectGender(data) }),
    save: async (values: any, ctx) => {
      await ctx.patchUserAttributes({ attributes: { gender: values.gender } })
    },
  },
  'location': {
    key: 'location',
    title: 'Where are you located?',
    description: '',
    helpText: 'Search for your city and state to set your primary location.',
    Component: LocationForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (data: OnboardingData) => ({ primaryLocation: selectPrimaryPlaceKitLocation(data) }),
    save: async (values: any, ctx) => {
      if (!values.primaryLocation) return
      await ctx.updateMyUser({
        location: {
          city: values.primaryLocation.city,
          state: values.primaryLocation.state,
          country: 'United States',
        },
      })
    },
  },
  'work-location': {
    key: 'work-location',
    title: 'Where can you work as a local?',
    description: '',
    helpText: 'Add cities where you can work without travel/lodging needs. Avoid duplicates.',
    Component: WorkLocationForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (data: OnboardingData) => ({ locations: [selectPrimaryPlaceKitLocation(data), ...selectWorkLocations(data)] }),
    save: async (values: any, ctx) => {
      const workLocations = (values.locations || [])
        .filter(Boolean)
        .map((loc: any) => `${loc.city}, ${loc.state}`)
      await ctx.updateMyUser({ workLocation: workLocations })
    },
  },
  'headshots': {
    key: 'headshots',
    title: 'Headshots',
    description: 'Upload your professional headshots to showcase your look.',
    helpText: 'Upload at least one clear, well-lit headshot.',
    Component: HeadshotsForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (_data: OnboardingData) => ({}),
    save: async (_values: any) => {
      // No-op; images saved via upload component
    },
  },
  'sizing': {
    key: 'sizing',
    title: 'Size Card',
    description:
      'Optional - Not all sizing metrics may apply to you. Only input what is relevant to you.',
    Component: SizingForm as unknown as ComponentType<FormProps<any>>,
    getInitialValues: (_data: OnboardingData) => ({}),
    save: async (_values: any) => {
      // No-op; sizing sections manage their own persistence
    },
  },
  'skills': {
    key: 'skills',
    title: 'Add your skills',
    description: 'What genre and special skills are you proficient in?',
    helpText: 'Add at least one genre and one skill to help others understand your strengths.',
    Component: SkillsForm as unknown as ComponentType<FormProps<any>>,
    schema: skillsSchema,
    getInitialValues: (data: OnboardingData) => selectSkills(data),
    save: async (values: any, ctx) => {
      await ctx.updateMyResume({
        ...values,
        experiences: ctx.data.user?.resume?.experiences,
      })
    },
  },
  'representation': {
    key: 'representation',
    title: 'Are you represented by an agent?',
    description: 'Select one',
    helpText: 'Your representation status helps tailor your opportunities.',
    Component: RepresentationForm as unknown as ComponentType<FormProps<any>>,
    schema: representationSchema,
    getInitialValues: (data: OnboardingData) => selectRepresentationStatus(data),
    save: async (values: any, ctx) => {
      await ctx.updateMyUser({ representationStatus: values.representationStatus })
    },
  },
  'agency': {
    key: 'agency',
    title: 'Select Agency',
    description: 'Search and select your representation agency',
    helpText: 'Search by agency name. If you cannot find it, contact support.',
    Component: AgencyForm as unknown as ComponentType<FormProps<any>>,
    schema: agencySchema,
    getInitialValues: (data: OnboardingData) => selectAgencyId(data),
    save: async (values: any, ctx) => {
      if (values.agencyId) {
        await ctx.addMyRepresentation({ agencyId: values.agencyId as any })
      }
    },
  },
} as const

export type StepKey = keyof typeof STEP_REGISTRY
