import type { ComponentType } from 'react'
import type { FormProps } from '~/components/forms/onboarding/contracts'
import type { OnboardingData } from '~/hooks/useOnboardingData'
import { DisplayNameFormV2, displayNameSchema } from '~/components/forms/onboarding/v2/DisplayNameFormV2'
import { selectDisplayName } from './selectors'

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
    Component: DisplayNameFormV2 as unknown as ComponentType<FormProps<any>>, // keep loose until all forms migrate
    schema: displayNameSchema,
    getInitialValues: (data: OnboardingData) => ({ displayName: selectDisplayName(data) }),
    save: async (_values: any) => {
      // Route/screen should provide the actual save via onSubmit for now
    },
  },
} as const

export type StepKey = keyof typeof STEP_REGISTRY
