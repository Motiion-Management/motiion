import { query, mutation } from './_generated/server'
import { ConvexError } from 'convex/values'
import {
  analyzeOnboardingProgress,
  isOnboardingComplete
} from './onboardingAnalysis'
import { CURRENT_ONBOARDING_VERSION } from './onboardingConfig'

export const getOnboardingStatus = query({
  handler: async (ctx) => {
    // Get user directly from the database instead of calling another query
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      return null
    }

    return analyzeOnboardingProgress(user, CURRENT_ONBOARDING_VERSION)
  }
})

export const completeOnboarding = mutation({
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

    // Verify that onboarding is actually complete
    const isComplete = isOnboardingComplete(user, CURRENT_ONBOARDING_VERSION)
    if (!isComplete) {
      const status = analyzeOnboardingProgress(user, CURRENT_ONBOARDING_VERSION)
      throw new ConvexError(
        `Cannot complete onboarding. Missing required fields: ${status.missingFields.join(', ')}`
      )
    }

    // Mark onboarding as completed
    await ctx.db.patch(user._id, {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
      onboardingVersion: CURRENT_ONBOARDING_VERSION
    })

    return { success: true }
  }
})

export const resetOnboarding = mutation({
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
      onboardingVersion: undefined
    })

    return { success: true }
  }
})

export const getOnboardingProgress = query({
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

    const status = analyzeOnboardingProgress(user, CURRENT_ONBOARDING_VERSION)

    return {
      progress: status.progress,
      currentStep: status.currentStep,
      currentStepIndex: status.currentStepIndex,
      totalSteps: status.totalSteps,
      isComplete: status.isComplete
    }
  }
})

export const debugOnboardingStatus = query({
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

    const status = analyzeOnboardingProgress(user, CURRENT_ONBOARDING_VERSION)

    // Return detailed debug information
    return {
      ...status,
      userData: {
        profileType: user.profileType,
        headshots: user.headshots?.length || 0,
        gender: user.gender,
        location: !!user.location,
        sizing: !!user.sizing,
        representation: !!user.representation,
        experiences: user.resume?.experiences?.length || 0,
        unionStatus: user.unionStatus,
        companyName: user.companyName,
        onboardingCompleted: user.onboardingCompleted,
        onboardingVersion: user.onboardingVersion
      }
    }
  }
})
