import { zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

// Step validation configuration
const zStepValidation = z.object({
  type: z.enum(['backend', 'local']),
  endpoint: z.string().optional()
})

// Conditional visibility configuration
const zStepConditional = z.object({
  field: z.string(),
  value: z.string(),
  show: z.boolean()
})

// Individual step definition
const zOnboardingStep = z.object({
  id: z.string(),
  name: z.string(),
  route: z.string(),
  required: z.array(z.string()),
  minItems: z.number().optional(),
  description: z.string().optional(),
  conditional: zStepConditional.optional(),
  validation: zStepValidation.optional()
})

// Decision branch configuration
const zDecisionBranch = z.object({
  value: z.string(),
  nextStep: z.string()
})

// Decision point configuration
const zDecisionPoint = z.object({
  stepId: z.string(),
  field: z.string(),
  branches: z.array(zDecisionBranch)
})

// Main onboarding flow object
const onboardingFlowFields = {
  version: z.string(),
  profileType: z.enum(['dancer', 'choreographer', 'guest']),
  steps: z.array(zOnboardingStep),
  decisionPoints: z.array(zDecisionPoint),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  description: z.string().optional()
}

export const OnboardingFlows = Table(
  'onboardingFlows',
  zodToConvexFields(onboardingFlowFields)
)

// Export types for use in other files
export type OnboardingStep = z.infer<typeof zOnboardingStep>
export type DecisionPoint = z.infer<typeof zDecisionPoint>
export type OnboardingFlow = z.infer<z.ZodObject<typeof onboardingFlowFields>>
