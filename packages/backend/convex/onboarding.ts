import { query, mutation } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { CURRENT_ONBOARDING_VERSION, getOnboardingFlow, getStepRoute, ProfileType } from './onboardingConfig'
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
      onboardingCompletedAt: new Date().toISOString(),
      onboardingVersion: CURRENT_ONBOARDING_VERSION
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

export const setOnboardingStep = mutation({
  args: { step: v.string() },
  handler: async (ctx, { step }) => {
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
    const flow = getOnboardingFlow(profileType, CURRENT_ONBOARDING_VERSION)
    const stepIndex = flow.findIndex((s) => s.step === step)

    if (stepIndex === -1) {
      throw new ConvexError(`Invalid step: ${step}`)
    }

    await ctx.db.patch(user._id, {
      currentOnboardingStep: step,
      currentOnboardingStepIndex: stepIndex
    })

    return { success: true }
  }
})

// Removed legacy validation — screen owns validation

// Removed legacy getUserOnboardingFlow — client defines flow

// Removed migration

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

    const step = (user.currentOnboardingStep as string) || 'profile-type'
    const redirectPath = `/app/onboarding/${step}`
    return { shouldRedirect: true, redirectPath }
  }
})
