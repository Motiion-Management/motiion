import { zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

// Step validation configuration
const zStepValidation = z.object({
  type: z.enum(['backend', 'local']),
  endpoint: z.string().optional()
})

// Form field configuration
const zFormField = z.object({
  name: z.string(),
  required: z.boolean(),
  minItems: z.number().optional(),
  maxItems: z.number().optional()
})

// Navigation configuration for decision steps
const zDecisionNavigation = z.object({
  field: z.string(), // Field that determines the decision
  branches: z.array(z.object({
    value: z.string(),
    nextStep: z.string()
  })),
  defaultNext: z.string().optional() // Fallback if no branch matches
})

// Individual step definition with enhanced navigation
const zOnboardingStepV3 = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(), // The route path (e.g., '/onboarding/profile-type')
  type: z.enum(['simple', 'decision']),
  
  // Navigation fields - pre-calculated
  nextStep: z.string().optional(), // For simple steps
  previousStep: z.string().optional(),
  decisionNavigation: zDecisionNavigation.optional(), // For decision steps
  
  // Form configuration
  fields: z.array(zFormField),
  autoSubmit: z.boolean().default(true),
  submitDelay: z.number().optional(), // Milliseconds to wait before auto-submit
  
  // Validation
  validation: zStepValidation.optional(),
  
  // UI configuration
  title: z.string(),
  description: z.string().optional(),
  skipLabel: z.string().optional(),
  skipAllowed: z.boolean().default(false),
  
  // Conditional visibility
  conditional: z.object({
    field: z.string(),
    operator: z.enum(['equals', 'notEquals', 'in', 'notIn']),
    value: z.union([z.string(), z.array(z.string())]),
    show: z.boolean()
  }).optional()
})

// Flow metadata
const zFlowMetadata = z.object({
  startStep: z.string(),
  endStep: z.string(),
  totalSteps: z.number(),
  estimatedMinutes: z.number().optional()
})

// Main onboarding flow object with enhanced structure
const onboardingFlowV3Fields = {
  version: z.string(),
  profileType: z.enum(['dancer', 'choreographer', 'guest']),
  
  // Steps stored as a record for easy lookup
  steps: z.record(z.string(), zOnboardingStepV3),
  
  // Flow metadata
  metadata: zFlowMetadata,
  
  // Feature flags
  features: z.object({
    autoSubmit: z.boolean().default(true),
    progressBar: z.boolean().default(true),
    skipEnabled: z.boolean().default(false),
    backButtonEnabled: z.boolean().default(true)
  }).optional(),
  
  // Status
  isActive: z.boolean(),
  isDefault: z.boolean().default(false),
  
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  
  // Documentation
  description: z.string().optional(),
  changelog: z.array(z.object({
    date: z.string(),
    description: z.string(),
    author: z.string()
  })).optional()
}

export const OnboardingFlowsV3 = Table(
  'onboardingFlowsV3',
  zodToConvexFields(onboardingFlowV3Fields)
)

// Export types for use in other files
export type OnboardingStepV3 = z.infer<typeof zOnboardingStepV3>
export type FlowMetadata = z.infer<typeof zFlowMetadata>
export type OnboardingFlowV3 = z.infer<z.ZodObject<typeof onboardingFlowV3Fields>>