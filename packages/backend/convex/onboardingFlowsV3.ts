import { query, mutation, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { type OnboardingStepV3, type OnboardingFlowV3 } from './validators/onboardingFlowsV3'

// Helper function to generate step path
const generateStepPath = (stepId: string): string => {
  return `/onboarding/${stepId}`
}

// Helper function to convert old step format to new V3 format
const convertStepToV3 = (
  oldStep: any,
  index: number,
  allSteps: any[],
  decisionPoints: any[]
): [string, OnboardingStepV3] => {
  const stepId = oldStep.step || oldStep.id
  const isDecision = decisionPoints.some(dp => dp.stepId === stepId)
  
  // Find decision point configuration if this is a decision step
  const decisionPoint = decisionPoints.find(dp => dp.stepId === stepId)
  
  // Calculate navigation
  let nextStep: string | undefined
  let decisionNavigation: OnboardingStepV3['decisionNavigation'] | undefined
  
  if (isDecision && decisionPoint) {
    // For decision steps, create decision navigation
    decisionNavigation = {
      field: decisionPoint.field,
      branches: decisionPoint.branches.map((branch: any) => ({
        value: branch.value,
        nextStep: branch.nextStep
      })),
      defaultNext: allSteps[index + 1]?.step || allSteps[index + 1]?.id
    }
  } else {
    // For simple steps, just set nextStep
    nextStep = index < allSteps.length - 1 
      ? (allSteps[index + 1].step || allSteps[index + 1].id)
      : undefined
  }
  
  const previousStep = index > 0 
    ? (allSteps[index - 1].step || allSteps[index - 1].id)
    : undefined
  
  // Convert required fields to field configuration
  const fields = oldStep.required.map((fieldName: string) => ({
    name: fieldName,
    required: true,
    minItems: oldStep.minItems,
    maxItems: oldStep.maxItems
  }))
  
  const stepV3: OnboardingStepV3 = {
    id: stepId,
    name: oldStep.name || stepId,
    path: generateStepPath(stepId),
    type: isDecision ? 'decision' : 'simple',
    
    // Navigation
    nextStep: isDecision ? undefined : nextStep,
    previousStep,
    decisionNavigation,
    
    // Form configuration
    fields,
    autoSubmit: true,
    submitDelay: 800, // Default 800ms delay
    
    // Validation
    validation: oldStep.validation,
    
    // UI configuration
    title: oldStep.name || stepId,
    description: oldStep.description,
    skipAllowed: false,
    
    // Conditional visibility
    conditional: oldStep.conditional
  }
  
  return [stepId, stepV3]
}

// Get the current active flow for a profile type
export const getActiveFlowV3 = query({
  args: {
    profileType: v.union(v.literal('dancer'), v.literal('choreographer'), v.literal('guest'))
  },
  returns: v.union(
    v.object({
      _id: v.id('onboardingFlowsV3'),
      version: v.string(),
      profileType: v.union(v.literal('dancer'), v.literal('choreographer'), v.literal('guest')),
      steps: v.any(),
      metadata: v.object({
        startStep: v.string(),
        endStep: v.string(),
        totalSteps: v.number(),
        estimatedMinutes: v.optional(v.number())
      }),
      features: v.optional(v.object({
        autoSubmit: v.boolean(),
        progressBar: v.boolean(),
        skipEnabled: v.boolean(),
        backButtonEnabled: v.boolean()
      })),
      isActive: v.boolean(),
      isDefault: v.boolean(),
      createdAt: v.string(),
      updatedAt: v.optional(v.string())
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // First try to get the default flow
    const defaultFlow = await ctx.db
      .query('onboardingFlowsV3')
      .withIndex('by_isDefault', q => q.eq('isDefault', true))
      .filter(q => q.eq(q.field('profileType'), args.profileType))
      .filter(q => q.eq(q.field('isActive'), true))
      .first()
    
    if (defaultFlow) {
      return defaultFlow
    }
    
    // Otherwise get any active flow for this profile type
    const activeFlow = await ctx.db
      .query('onboardingFlowsV3')
      .withIndex('by_isActive', q => q.eq('isActive', true))
      .filter(q => q.eq(q.field('profileType'), args.profileType))
      .order('desc')
      .first()
    
    return activeFlow
  }
})

// Migration function to convert old flows to V3 format
export const migrateFlowToV3 = internalMutation({
  args: {
    flowId: v.id('onboardingFlows')
  },
  returns: v.id('onboardingFlowsV3'),
  handler: async (ctx, args) => {
    const oldFlow = await ctx.db.get(args.flowId)
    if (!oldFlow) {
      throw new Error('Flow not found')
    }
    
    // Convert steps to record format
    const stepsRecord: Record<string, OnboardingStepV3> = {}
    const stepIds: string[] = []
    
    oldFlow.steps.forEach((step, index) => {
      const [stepId, stepV3] = convertStepToV3(
        step, 
        index, 
        oldFlow.steps, 
        oldFlow.decisionPoints
      )
      stepsRecord[stepId] = stepV3
      stepIds.push(stepId)
    })
    
    // Create metadata
    const metadata = {
      startStep: stepIds[0],
      endStep: stepIds[stepIds.length - 1],
      totalSteps: stepIds.length,
      estimatedMinutes: Math.ceil(stepIds.length * 2) // Rough estimate: 2 mins per step
    }
    
    // Create the new flow
    const newFlowId = await ctx.db.insert('onboardingFlowsV3', {
      version: oldFlow.version + '_v3',
      profileType: oldFlow.profileType,
      steps: stepsRecord,
      metadata,
      features: {
        autoSubmit: true,
        progressBar: true,
        skipEnabled: false,
        backButtonEnabled: true
      },
      isActive: oldFlow.isActive,
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'migration',
      description: `Migrated from ${oldFlow.version} - ${oldFlow.description || 'No description'}`
    })
    
    return newFlowId
  }
})

// Migrate all active flows
export const migrateAllActiveFlows = internalMutation({
  args: {},
  returns: v.array(v.object({
    oldFlowId: v.id('onboardingFlows'),
    newFlowId: v.id('onboardingFlowsV3'),
    profileType: v.string(),
    version: v.string()
  })),
  handler: async (ctx) => {
    // Get all active flows from the old system
    const activeFlows = await ctx.db
      .query('onboardingFlows')
      .withIndex('by_isActive', q => q.eq('isActive', true))
      .collect()
    
    const results = []
    
    for (const flow of activeFlows) {
      const newFlowId = await ctx.runMutation(internal.onboardingFlowsV3.migrateFlowToV3, {
        flowId: flow._id
      })
      
      results.push({
        oldFlowId: flow._id,
        newFlowId,
        profileType: flow.profileType,
        version: flow.version
      })
    }
    
    return results
  }
})

// Create a new flow from scratch (for testing)
export const createDancerFlowV3 = mutation({
  args: {},
  returns: v.id('onboardingFlowsV3'),
  handler: async (ctx) => {
    const steps: Record<string, OnboardingStepV3> = {
      'profile-type': {
        id: 'profile-type',
        name: 'Profile Type',
        path: '/onboarding/profile-type',
        type: 'decision',
        previousStep: undefined,
        decisionNavigation: {
          field: 'profileType',
          branches: [
            { value: 'dancer', nextStep: 'headshots' },
            { value: 'choreographer', nextStep: 'experience' },
            { value: 'guest', nextStep: 'welcome' }
          ]
        },
        fields: [{ name: 'profileType', required: true }],
        autoSubmit: true,
        submitDelay: 500,
        title: 'Select Your Profile Type',
        description: 'Choose how you want to use the platform',
        skipAllowed: false
      },
      'headshots': {
        id: 'headshots',
        name: 'Headshots',
        path: '/onboarding/headshots',
        type: 'simple',
        nextStep: 'height',
        previousStep: 'profile-type',
        fields: [{ name: 'headshots', required: true, minItems: 1, maxItems: 5 }],
        autoSubmit: false, // Manual submit for file uploads
        title: 'Upload Your Headshots',
        description: 'Add professional photos for your profile',
        skipAllowed: false
      },
      'height': {
        id: 'height',
        name: 'Height',
        path: '/onboarding/height',
        type: 'simple',
        nextStep: 'ethnicity',
        previousStep: 'headshots',
        fields: [{ name: 'height', required: true }],
        autoSubmit: true,
        submitDelay: 800,
        title: 'Your Height',
        description: 'Enter your height information',
        skipAllowed: false
      },
      'ethnicity': {
        id: 'ethnicity',
        name: 'Ethnicity',
        path: '/onboarding/ethnicity',
        type: 'simple',
        nextStep: 'hair-color',
        previousStep: 'height',
        fields: [{ name: 'ethnicity', required: true }],
        autoSubmit: true,
        submitDelay: 800,
        title: 'Your Ethnicity',
        description: 'Select your ethnicity',
        skipAllowed: false
      },
      'hair-color': {
        id: 'hair-color',
        name: 'Hair Color',
        path: '/onboarding/hair-color',
        type: 'simple',
        nextStep: 'eye-color',
        previousStep: 'ethnicity',
        fields: [{ name: 'hairColor', required: true }],
        autoSubmit: true,
        submitDelay: 800,
        title: 'Your Hair Color',
        description: 'Select your hair color',
        skipAllowed: false
      },
      'eye-color': {
        id: 'eye-color',
        name: 'Eye Color',
        path: '/onboarding/eye-color',
        type: 'simple',
        nextStep: 'gender',
        previousStep: 'hair-color',
        fields: [{ name: 'eyeColor', required: true }],
        autoSubmit: true,
        submitDelay: 800,
        title: 'Your Eye Color',
        description: 'Select your eye color',
        skipAllowed: false
      },
      'gender': {
        id: 'gender',
        name: 'Gender',
        path: '/onboarding/gender',
        type: 'simple',
        nextStep: 'sizing',
        previousStep: 'eye-color',
        fields: [{ name: 'gender', required: true }],
        autoSubmit: true,
        submitDelay: 800,
        title: 'Your Gender',
        description: 'Select your gender',
        skipAllowed: false
      },
      'sizing': {
        id: 'sizing',
        name: 'Sizing',
        path: '/onboarding/sizing',
        type: 'simple',
        nextStep: 'location',
        previousStep: 'gender',
        fields: [{ name: 'sizing', required: true }],
        autoSubmit: true,
        submitDelay: 800,
        title: 'Clothing & Measurements',
        description: 'Enter your sizing information',
        skipAllowed: false
      },
      'location': {
        id: 'location',
        name: 'Location',
        path: '/onboarding/location',
        type: 'simple',
        nextStep: 'work-location',
        previousStep: 'sizing',
        fields: [{ name: 'location', required: true }],
        autoSubmit: true,
        submitDelay: 800,
        title: 'Your Location',
        description: 'Where are you based?',
        skipAllowed: false
      },
      'work-location': {
        id: 'work-location',
        name: 'Work Location',
        path: '/onboarding/work-location',
        type: 'simple',
        nextStep: 'complete',
        previousStep: 'location',
        fields: [{ name: 'workLocation', required: true }],
        autoSubmit: true,
        submitDelay: 800,
        title: 'Work Locations',
        description: 'Where are you willing to work?',
        skipAllowed: false
      },
      'complete': {
        id: 'complete',
        name: 'Complete',
        path: '/onboarding/complete',
        type: 'simple',
        nextStep: undefined,
        previousStep: 'work-location',
        fields: [],
        autoSubmit: false,
        title: 'Onboarding Complete!',
        description: 'Welcome to the platform',
        skipAllowed: false
      }
    }
    
    const flowId = await ctx.db.insert('onboardingFlowsV3', {
      version: 'v3_initial',
      profileType: 'dancer',
      steps,
      metadata: {
        startStep: 'profile-type',
        endStep: 'complete',
        totalSteps: Object.keys(steps).length,
        estimatedMinutes: 15
      },
      features: {
        autoSubmit: true,
        progressBar: true,
        skipEnabled: false,
        backButtonEnabled: true
      },
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      description: 'Initial V3 flow for dancers with auto-submit enabled'
    })
    
    return flowId
  }
})