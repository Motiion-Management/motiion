import { query, mutation, internalMutation } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import {
  analyzeOnboardingProgress,
  isOnboardingComplete,
  checkStepCompletion,
  getMissingFields
} from './onboardingAnalysis'
import {
  CURRENT_ONBOARDING_VERSION,
  getOnboardingFlow,
  getStepRoute,
  OnboardingStep,
  ProfileType
} from './onboardingConfig'
import type { RegisteredQuery, RegisteredMutation } from 'convex/server'

export const getOnboardingStatus: RegisteredQuery<
  'public',
  Record<string, never>,
  {
    isComplete: boolean
    currentStep: string
    currentStepIndex: number
    totalSteps: number
    redirectPath: string | null
    isCurrentStepDataComplete: boolean
    progress: number
    version: number
    canAdvance: boolean
    nextRequiredFields: string[]
    missingFields: string[]
    stepDescription?: string
    shouldRedirect: boolean
  } | null
> = query({
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

    // Use navigation position if set, otherwise fall back to data-based calculation
    const profileType = (user.profileType || 'dancer') as ProfileType
    const flow = getOnboardingFlow(profileType, CURRENT_ONBOARDING_VERSION)

    let currentStep: string
    let currentStepIndex: number

    if (
      user.currentOnboardingStep &&
      user.currentOnboardingStepIndex !== undefined
    ) {
      // Use explicit navigation position
      currentStep = user.currentOnboardingStep
      currentStepIndex = user.currentOnboardingStepIndex
    } else {
      // Fall back to data-based calculation for new users
      const analysis = analyzeOnboardingProgress(
        user,
        CURRENT_ONBOARDING_VERSION
      )
      currentStep = analysis.currentStep || 'profile-type'
      currentStepIndex = analysis.currentStepIndex
    }

    // Get data completion status for current step
    const currentStepConfig = flow[currentStepIndex]
    const isCurrentStepDataComplete = currentStepConfig
      ? checkStepCompletion(user, currentStepConfig)
      : false

    return {
      isComplete: user.onboardingCompleted || false,
      currentStep,
      currentStepIndex,
      totalSteps: flow.length,
      progress: Math.round((currentStepIndex / flow.length) * 100),
      version: CURRENT_ONBOARDING_VERSION,
      redirectPath: getStepRoute(currentStep),

      // Data completion info
      isCurrentStepDataComplete,
      canAdvance: isCurrentStepDataComplete,

      // Keep existing fields for compatibility
      nextRequiredFields: currentStepConfig?.required || [],
      missingFields: currentStepConfig
        ? getMissingFields(user, currentStepConfig)
        : [],
      stepDescription: currentStepConfig?.description,

      // Maintain shouldRedirect for backward compatibility
      shouldRedirect: !user.onboardingCompleted && !!currentStep
    }
  }
})

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
      onboardingVersion: undefined
    })

    return { success: true }
  }
})

export const getOnboardingProgress: RegisteredQuery<
  'public',
  Record<string, never>,
  {
    progress: number
    currentStep: string | null
    isComplete: boolean
    currentStepIndex: number
    totalSteps: number
    completedSteps: Set<string>
    profileType: string
  } | null
> = query({
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

export const debugOnboardingStatus: RegisteredQuery<
  'public',
  Record<string, never>,
  any
> = query({
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
        gender: user.attributes?.gender,
        location: !!user.location,
        sizing: !!user.sizing,
        representation: !!user.representation,
        experiences: user.resume?.experiences?.length || 0,
        companyName: user.companyName,
        onboardingCompleted: user.onboardingCompleted,
        onboardingVersion: user.onboardingVersion,
        currentOnboardingStep: user.currentOnboardingStep,
        currentOnboardingStepIndex: user.currentOnboardingStepIndex
      }
    }
  }
})

export const advanceOnboardingStep: RegisteredMutation<
  'public',
  Record<string, never>,
  { nextStep: string | null; route: string }
> = mutation({
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
    const flow = getOnboardingFlow(profileType, CURRENT_ONBOARDING_VERSION)
    const currentIndex = user.currentOnboardingStepIndex ?? 0
    const currentStep = flow[currentIndex]

    // Verify current step is complete before advancing
    if (currentStep && !checkStepCompletion(user, currentStep)) {
      const missingFields = getMissingFields(user, currentStep)
      throw new ConvexError(
        `Cannot advance. Complete current step first. Missing: ${missingFields.join(', ')}`
      )
    }

    // Get the user's filtered flow (which excludes agency for non-represented users)
    const userProfileType = (user.profileType || 'dancer') as ProfileType
    const baseFlow = getOnboardingFlow(
      userProfileType,
      CURRENT_ONBOARDING_VERSION
    )
    const userFlow = baseFlow.filter((step) => {
      if (step.step === 'agency') {
        return user.representationStatus === 'represented'
      }
      return true
    })

    // Find current step in filtered flow and advance to next
    const currentIndexInUserFlow = userFlow.findIndex(
      (step) => step.step === currentStep?.step
    )
    const nextStepInUserFlow = userFlow[currentIndexInUserFlow + 1]

    if (nextStepInUserFlow) {
      // Find the index of this step in the original flow for backend tracking
      const nextIndexInOriginalFlow = baseFlow.findIndex(
        (step) => step.step === nextStepInUserFlow.step
      )

      await ctx.db.patch(user._id, {
        currentOnboardingStep: nextStepInUserFlow.step,
        currentOnboardingStepIndex: nextIndexInOriginalFlow
      })
      return {
        nextStep: nextStepInUserFlow.step,
        route: getStepRoute(nextStepInUserFlow.step)
      }
    } else {
      // All steps complete
      await ctx.db.patch(user._id, {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
        onboardingVersion: CURRENT_ONBOARDING_VERSION
      })
      return { nextStep: null, route: '/app/home' }
    }
  }
})

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

export const validateCurrentOnboardingStep = mutation({
  args: { currentStep: v.string() },
  handler: async (ctx, { currentStep }) => {
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
    const step = flow.find((s) => s.step === currentStep)

    if (!step) {
      return {
        isValid: false,
        missingFields: ['invalid step'],
        step: currentStep
      }
    }

    const isComplete = checkStepCompletion(user, step)
    const missingFields = getMissingFields(user, step)

    return {
      isValid: isComplete,
      missingFields,
      step: currentStep
    }
  }
})

export const getUserOnboardingFlow: RegisteredQuery<
  'public',
  Record<string, never>,
  OnboardingStep[]
> = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      return []
    }

    const profileType = (user.profileType || 'dancer') as ProfileType
    const flow = getOnboardingFlow(profileType, CURRENT_ONBOARDING_VERSION)

    // Filter out agency step if user doesn't have representation
    return flow.filter((step) => {
      if (step.step === 'agency') {
        return user.representationStatus === 'represented'
      }
      return true
    })
  }
})

export const migrateNavigationPosition: RegisteredMutation<
  'internal',
  Record<string, never>,
  { totalUsers: number; migrated: number; failed: number }
> = internalMutation({
  handler: async (ctx) => {
    // Get all users who don't have navigation position set
    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('currentOnboardingStep'), undefined))
      .collect()

    let migrated = 0
    let errors = 0

    for (const user of users) {
      try {
        // Calculate their position based on data completion
        const analysis = analyzeOnboardingProgress(
          user,
          CURRENT_ONBOARDING_VERSION
        )

        await ctx.db.patch(user._id, {
          currentOnboardingStep: analysis.currentStep || 'profile-type',
          currentOnboardingStepIndex: analysis.currentStepIndex
        })

        migrated++
      } catch (error) {
        console.error(`Failed to migrate user ${user._id}:`, error)
        errors++
      }
    }

    return {
      totalUsers: users.length,
      migrated,
      errors,
      message: `Migration complete: ${migrated} users migrated, ${errors} errors`
    }
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

    // If onboarding completed, never redirect to onboarding
    if (user.onboardingCompleted) {
      return { shouldRedirect: false, redirectPath: '/app' }
    }

    const step = (user.currentOnboardingStep as string) || 'profile-type'
    const redirectPath = `/app/onboarding/${step}`
    return { shouldRedirect: true, redirectPath }
  }
})
