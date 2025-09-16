import { query, mutation } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { zMutation } from '@packages/zodvex'
import { z } from 'zod'
import {
  getOnboardingFlow as getOnboardingFlowConfig,
  ProfileType,
  STEP,
  STEP_ROUTES,
  getFlowCompletionStatus
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

    // PHASE 2: Create profile in new table if it doesn't exist
    if (user.profileType && !user.activeDancerId && !user.activeChoreographerId) {
      if (user.profileType === 'dancer') {
        // Check if profile already exists
        const existingProfile = await ctx.db
          .query('dancers')
          .withIndex('by_userId', (q) => q.eq('userId', user._id))
          .first()

        if (!existingProfile) {
          // Create dancer profile with user's data
          const profileId = await ctx.db.insert('dancers', {
            userId: user._id,
            isActive: true,
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
      } else if (user.profileType === 'choreographer') {
        // Check if profile already exists
        const existingProfile = await ctx.db
          .query('choreographers')
          .withIndex('by_userId', (q) => q.eq('userId', user._id))
          .first()

        if (!existingProfile) {
          // Create choreographer profile with user's data
          const profileId = await ctx.db.insert('choreographers', {
            userId: user._id,
            isActive: true,
            isPrimary: true,
            createdAt: new Date().toISOString(),
            headshots: user.headshots,
            representation: user.representation,
            representationStatus: user.representationStatus,
            attributes: user.attributes,
            sizing: user.sizing,
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

