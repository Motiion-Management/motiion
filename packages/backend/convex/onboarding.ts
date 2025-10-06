import { query, mutation } from './_generated/server'
import { zm } from './util'
import { ConvexError, v } from 'convex/values'
import { z } from 'zod'
import {
  getOnboardingFlow as getOnboardingFlowConfig,
  ProfileType,
  STEP,
  STEP_ROUTES,
  getFlowCompletionStatus,
  CURRENT_ONBOARDING_VERSION,
  isStepComplete
} from './onboardingConfig'
import type { RegisteredMutation } from 'convex/server'

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

    // Create profile in new table if it doesn't exist
    if (
      user.profileType &&
      !user.activeDancerId &&
      !user.activeChoreographerId
    ) {
      await createProfileFromUserData(ctx, user)
      // Reload user to get the newly created active profile ID
      const updatedUser = await ctx.db.get(user._id)
      if (!updatedUser) {
        throw new ConvexError('Failed to reload user after profile creation')
      }
      user._id = updatedUser._id
      user.activeDancerId = updatedUser.activeDancerId
      user.activeChoreographerId = updatedUser.activeChoreographerId
    }

    // Get active profile ID
    const activeProfileId =
      user.activeDancerId || user.activeChoreographerId
    if (!activeProfileId) {
      throw new ConvexError('No active profile found')
    }

    // Mark onboarding as completed on the profile (non-blocking; individual screens own validation)
    await ctx.db.patch(activeProfileId, {
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

    // Get active profile ID
    const activeProfileId =
      user.activeDancerId || user.activeChoreographerId
    if (!activeProfileId) {
      throw new ConvexError('No active profile found')
    }

    // Reset onboarding status on profile (useful for testing or major onboarding changes)
    await ctx.db.patch(activeProfileId, {
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

export const setOnboardingStep = zm({
  args: { step: z.string() },
  returns: z.object({ success: z.boolean() }),
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

    // Get active profile ID
    const activeProfileId =
      user.activeDancerId || user.activeChoreographerId
    if (!activeProfileId) {
      throw new ConvexError('No active profile found')
    }

    const profileType = (user.profileType || 'dancer') as ProfileType
    const flow = getOnboardingFlowConfig(profileType)
    const stepIndex = flow.findIndex((s) => s.step === step)

    if (stepIndex === -1) {
      throw new ConvexError(`Invalid step: ${step}`)
    }

    await ctx.db.patch(activeProfileId, {
      currentOnboardingStep: step,
      currentOnboardingStepIndex: stepIndex
    })

    return { success: true }
  }
})

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

    // Get active profile for onboarding status (with fallback to user for backward compatibility)
    let profile = null
    const activeProfileId =
      user.activeDancerId || user.activeChoreographerId
    if (activeProfileId) {
      profile = await ctx.db.get(activeProfileId)
    }

    // Check onboarding completion (profile first, fallback to user)
    const onboardingCompleted = profile?.onboardingCompleted || user.onboardingCompleted
    if (onboardingCompleted) {
      return { shouldRedirect: false, redirectPath: '/app' }
    }

    // Get current step (profile first, fallback to user)
    const step =
      (profile?.currentOnboardingStep as STEP) ||
      (user.currentOnboardingStep as STEP) ||
      'profile-type'
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

    // Get active profile for validation
    let profile = null
    if (user.activeProfileType === 'dancer' && user.activeDancerId) {
      profile = await ctx.db.get(user.activeDancerId)
    } else if (
      user.activeProfileType === 'choreographer' &&
      user.activeChoreographerId
    ) {
      profile = await ctx.db.get(user.activeChoreographerId)
    }

    const status = getFlowCompletionStatus(user, profileType, profile)

    // Update profile's current step if it's different
    let wasUpdated = false
    const newStep = status.nextIncompleteStep || 'review'

    // Get active profile ID
    const activeProfileId =
      user.activeDancerId || user.activeChoreographerId
    if (!activeProfileId) {
      throw new ConvexError('No active profile found')
    }

    const currentStep = profile?.currentOnboardingStep || user.currentOnboardingStep
    if (currentStep !== newStep) {
      const flow = getOnboardingFlowConfig(profileType)
      const stepIndex = flow.findIndex((s) => s.step === newStep)

      await ctx.db.patch(activeProfileId, {
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

    // Get active profile for validation
    let profile = null
    if (user.activeProfileType === 'dancer' && user.activeDancerId) {
      profile = await ctx.db.get(user.activeDancerId)
    } else if (
      user.activeProfileType === 'choreographer' &&
      user.activeChoreographerId
    ) {
      profile = await ctx.db.get(user.activeChoreographerId)
    }

    const status = getFlowCompletionStatus(user, profileType, profile)

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

    // Get active profile for validation
    let profile = null
    if (user.activeProfileType === 'dancer' && user.activeDancerId) {
      profile = await ctx.db.get(user.activeDancerId)
    } else if (
      user.activeProfileType === 'choreographer' &&
      user.activeChoreographerId
    ) {
      profile = await ctx.db.get(user.activeChoreographerId)
    }

    return isStepComplete(step, user, profile)
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a profile (dancer or choreographer) from existing user data
 * Used during onboarding completion or migration
 */
async function createProfileFromUserData(
  ctx: any,
  user: any
): Promise<void> {
  const profileType = user.profileType

  if (profileType === 'dancer') {
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query('dancers')
      .withIndex('by_userId', (q: any) => q.eq('userId', user._id))
      .first()

    if (!existingProfile) {
      // Create dancer profile with user's data
      const profileId = await ctx.db.insert('dancers', {
        userId: user._id,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        headshots: user.headshots,
        representation: user.representation,
        representationStatus: user.representationStatus,
        attributes: user.attributes,
        sizing: user.sizing,
        resume: user.resume,
        links: user.links,
        sagAftraId: user.sagAftraId,
        training: user.training,
        workLocation: user.workLocation,
        location: user.location,
        profileCompleteness: 0,
        profileTipDismissed: user.profileTipDismissed,
        resumeImportedFields: user.resumeImportedFields,
        resumeImportVersion: user.resumeImportVersion,
        resumeImportedAt: user.resumeImportedAt,
        searchPattern: user.searchPattern || ''
      })

      // Update user with profile references
      await ctx.db.patch(user._id, {
        activeProfileType: 'dancer',
        activeDancerId: profileId
      })
    }
  } else if (profileType === 'choreographer') {
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query('choreographers')
      .withIndex('by_userId', (q: any) => q.eq('userId', user._id))
      .first()

    if (!existingProfile) {
      // Create choreographer profile with user's data
      const profileId = await ctx.db.insert('choreographers', {
        userId: user._id,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        headshots: user.headshots,
        representation: user.representation,
        representationStatus: user.representationStatus,
        resume: user.resume,
        links: user.links,
        companyName: user.companyName,
        workLocation: user.workLocation,
        location: user.location,
        databaseUse: user.databaseUse,
        verified: false,
        featured: false,
        profileCompleteness: 0,
        profileTipDismissed: user.profileTipDismissed,
        resumeImportedFields: user.resumeImportedFields,
        resumeImportVersion: user.resumeImportVersion,
        resumeImportedAt: user.resumeImportedAt,
        searchPattern: user.searchPattern || ''
      })

      // Update user with profile references
      await ctx.db.patch(user._id, {
        activeProfileType: 'choreographer',
        activeChoreographerId: profileId
      })
    }
  }
}
