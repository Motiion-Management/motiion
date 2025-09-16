import { query, mutation } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { zMutation } from '@packages/zodvex'
import { z } from 'zod'
import {
  getOnboardingFlow as getOnboardingFlowConfig,
  getStepRoute,
  ProfileType,
  STEP,
  STEP_ROUTES,
  getFlowCompletionStatus,
  isStepComplete
} from './onboardingConfig'
import type { RegisteredMutation, RegisteredQuery } from 'convex/server'

export const completeOnboarding: RegisteredMutation<
  'public',
  Record<string, never>,
  { success: boolean }
> = mutation({
  handler: async (ctx) => {
    // Get user directly from the database
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      throw new ConvexError('User not found')
    }

    // Mark onboarding as completed (non-blocking; individual screens own validation)
    await ctx.db.patch(user._id, {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString()
    })

    return { success: true }
  }
})

export const resetOnboarding: RegisteredMutation<
  'public',
  Record<string, never>,
  { success: boolean }
> = mutation({
  handler: async (ctx) => {
    // Get user directly from the database
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      throw new ConvexError('User not found')
    }

    // Reset onboarding status (useful for testing or major onboarding changes)
    await ctx.db.patch(user._id, {
      onboardingCompleted: false,
      onboardingCompletedAt: undefined,
      onboardingVersion: undefined,
      // Also clear navigation position so redirects start at the beginning
      currentOnboardingStep: undefined,
      currentOnboardingStepIndex: undefined
    })

    return { success: true }
  }
})

// Removed legacy progress/debug endpoints

// Removed legacy advance step — client controls flow

export const setOnboardingStep = zMutation(
  mutation,
  { step: z.string() },
  async (ctx, { step }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      throw new ConvexError('User not found')
    }

    const profileType = (user.profileType || 'dancer') as ProfileType
    const flow = getOnboardingFlowConfig(profileType)
    const stepIndex = flow.findIndex((s) => s.step === step)

    if (stepIndex === -1) {
      throw new ConvexError(`Invalid step: ${step}`)
    }

    await ctx.db.patch(user._id, {
      currentOnboardingStep: step,
      currentOnboardingStepIndex: stepIndex
    })

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Minimal redirect target for client guard: no heavy analysis, no flow logic
export const getOnboardingRedirect = query({
  args: {},
  returns: v.object({
    shouldRedirect: v.boolean(),
    redirectPath: v.string()
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { shouldRedirect: false, redirectPath: '/app' }
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      return { shouldRedirect: false, redirectPath: '/app' }
    }

    // If onboarding completed, never redirect to onboarding
    if (user.onboardingCompleted) {
      return { shouldRedirect: false, redirectPath: '/app' }
    }

    const step = (user.currentOnboardingStep as STEP) || 'profile-type'
    const redirectPath = STEP_ROUTES[step]
    return { shouldRedirect: true, redirectPath }
  }
})

// Determine and update onboarding status based on actual data
export const updateOnboardingStatus = mutation({
  args: {},
  returns: v.object({
    currentStep: v.string(),
    completedSteps: v.array(v.string()),
    incompleteSteps: v.array(v.string()),
    completionPercentage: v.number(),
    wasUpdated: v.boolean()
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      throw new ConvexError('User not found')
    }

    const profileType = (user.profileType || 'dancer') as ProfileType
    const status = getFlowCompletionStatus(user, profileType)

    // Update user's current step if it's different
    let wasUpdated = false
    const newStep = status.nextIncompleteStep || 'review'

    if (user.currentOnboardingStep !== newStep) {
      const flow = getOnboardingFlowConfig(profileType)
      const stepIndex = flow.findIndex((s) => s.step === newStep)

      await ctx.db.patch(user._id, {
        currentOnboardingStep: newStep,
        currentOnboardingStepIndex: stepIndex
      })
      wasUpdated = true
    }

    return {
      currentStep: newStep,
      completedSteps: status.completedSteps,
      incompleteSteps: status.incompleteSteps,
      completionPercentage: status.completionPercentage,
      wasUpdated
    }
  }
})

// Query to get onboarding status without updating
export const getOnboardingStatus = query({
  args: {},
  returns: v.object({
    currentStep: v.string(),
    completedSteps: v.array(v.string()),
    incompleteSteps: v.array(v.string()),
    completionPercentage: v.number(),
    isComplete: v.boolean()
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      throw new ConvexError('User not found')
    }

    const profileType = (user.profileType || 'dancer') as ProfileType
    const status = getFlowCompletionStatus(user, profileType)

    return {
      currentStep: status.nextIncompleteStep || 'review',
      completedSteps: status.completedSteps,
      incompleteSteps: status.incompleteSteps,
      completionPercentage: status.completionPercentage,
      isComplete: status.incompleteSteps.length === 0
    }
  }
})

// Check specific step completion
export const checkStepCompletion = query({
  args: { step: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { step }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return false

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) return false

    return isStepComplete(step, user)
  }
})

// Expose step routes configuration to frontend for data-driven UI
export const getStepRoutes = query({
  args: {},
  returns: v.any(),
  handler: async () => {
    return STEP_ROUTES
  }
})

// Get onboarding flow for a specific profile type
export const getOnboardingFlow = query({
  args: { profileType: v.string() },
  returns: v.any(),
  handler: async (ctx, { profileType }) => {
    return getOnboardingFlowConfig(profileType as ProfileType)
  }
})
