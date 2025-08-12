import { type z } from 'zod'

/**
 * Type-safe form store interface
 */
export interface FormStore<TValues = Record<string, unknown>> {
  getState: () => {
    values: TValues
    errors: Record<string, string[]>
    isSubmitting: boolean
    isValidating: boolean
  }
}

/**
 * Type-safe form instance
 * Compatible with TanStack Form API
 */
export interface TypedFormInstance<TValues = Record<string, unknown>> {
  store: FormStore<TValues>
  setFieldValue: <K extends keyof TValues>(field: K, value: TValues[K]) => void
  getFieldValue: <K extends keyof TValues>(field: K) => TValues[K]
  reset: () => void
  handleSubmit: () => Promise<void>
}

/**
 * Extract values type from a Zod schema
 */
export type InferSchemaValues<T> = T extends z.ZodType<infer U> ? U : never