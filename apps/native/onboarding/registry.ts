import type { ComponentType } from 'react'
import type { FormProps } from '~/components/forms/onboarding/contracts'
import type { OnboardingData } from '~/hooks/useOnboardingData'

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
  // Example (to be added during migration):
  // 'display-name': {
  //   key: 'display-name',
  //   title: 'Display name',
  //   description: 'Choose how your name appears.',
  //   Component: DisplayNameForm,
  //   schema: displayNameSchema,
  //   getInitialValues: selectDisplayName,
  //   save: saveDisplayName,
  // },
} as const

export type StepKey = keyof typeof STEP_REGISTRY
