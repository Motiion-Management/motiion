import { internalMutation } from '../_generated/server'
import { internal } from '../_generated/api'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'

/**
 * Phase 3: Migration Functions (Don't Run Yet)
 *
 * These functions migrate profile data from users table to dancers table.
 * They also REMOVE data from the original user fields to prevent duplicate sources of truth.
 */

export const migrateUserToDancerProfile = internalMutation({
  args: { userId: v.id('users') },
  returns: v.object({
    success: v.boolean(),
    profileId: v.union(v.id('dancers'), v.null()),
    message: v.string()
  }),
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId as Id<'users'>)
    if (!user) {
      return { success: false, profileId: null, message: 'User not found' }
    }

    // Check if user still has deprecated fields that need cleaning
    const hasDeprecatedFields = !!(
      user.profileType ||
      user.displayName ||
      user.location ||
      user.searchPattern ||
      user.onboardingCompleted !== undefined ||
      user.onboardingCompletedAt ||
      user.onboardingVersion ||
      user.currentOnboardingStep ||
      user.currentOnboardingStepIndex !== undefined ||
      user.headshots ||
      user.attributes ||
      user.sizing ||
      user.representation ||
      user.representationStatus ||
      user.links ||
      user.sagAftraId ||
      user.workLocation ||
      user.training ||
      user.resume ||
      user.resumeImportedFields ||
      user.resumeImportVersion ||
      user.resumeImportedAt ||
      user.profileTipDismissed !== undefined ||
      user.onboardingStep ||
      user.pointsEarned !== undefined
    )

    // Skip if already fully migrated (has activeDancerId and no deprecated fields)
    if (user.activeDancerId && !hasDeprecatedFields) {
      return {
        success: true,
        profileId: user.activeDancerId,
        message: 'Already migrated and clean'
      }
    }

    // Check if profile already exists
    const existing = await ctx.db
      .query('dancers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (existing) {
      // Profile exists - merge any missing data from user to profile
      const updates: any = {}

      // Copy missing identity fields
      if (!existing.displayName && user.displayName) {
        updates.displayName = user.displayName
      }

      // Copy missing onboarding state
      if (user.onboardingCompleted !== undefined && existing.onboardingCompleted === undefined) {
        updates.onboardingCompleted = user.onboardingCompleted
      }
      if (user.onboardingCompletedAt && !existing.onboardingCompletedAt) {
        updates.onboardingCompletedAt = user.onboardingCompletedAt
      }
      if (user.onboardingVersion && !existing.onboardingVersion) {
        updates.onboardingVersion = user.onboardingVersion
      }
      if (user.currentOnboardingStep && !existing.currentOnboardingStep) {
        updates.currentOnboardingStep = user.currentOnboardingStep
      }
      if (user.currentOnboardingStepIndex !== undefined && existing.currentOnboardingStepIndex === undefined) {
        updates.currentOnboardingStepIndex = user.currentOnboardingStepIndex
      }

      // Copy missing flattened resume fields
      if (user.resume?.projects && !existing.projects) {
        updates.projects = user.resume.projects
      }
      if (user.resume?.skills && !existing.skills) {
        updates.skills = user.resume.skills
      }
      if (user.resume?.genres && !existing.genres) {
        updates.genres = user.resume.genres
      }
      if (user.resume?.uploads && !existing.resumeUploads) {
        updates.resumeUploads = user.resume.uploads
      }

      // Copy missing profile data
      if (user.headshots && !existing.headshots) {
        updates.headshots = user.headshots
      }
      if (user.attributes && !existing.attributes) {
        updates.attributes = user.attributes
      }
      if (user.sizing && !existing.sizing) {
        updates.sizing = user.sizing
      }
      if (user.location && !existing.location) {
        updates.location = user.location
      }
      if (user.representation && !existing.representation) {
        updates.representation = user.representation
      }
      if (user.representationStatus && !existing.representationStatus) {
        updates.representationStatus = user.representationStatus
      }
      if (user.links && !existing.links) {
        updates.links = user.links
      }
      if (user.sagAftraId && !existing.sagAftraId) {
        updates.sagAftraId = user.sagAftraId
      }
      if (user.workLocation && !existing.workLocation) {
        updates.workLocation = user.workLocation
      }
      if (user.training && !existing.training) {
        updates.training = user.training
      }
      if (user.searchPattern && !existing.searchPattern) {
        updates.searchPattern = user.searchPattern
      }

      // Copy missing import tracking
      if (user.resumeImportedFields && !existing.resumeImportedFields) {
        updates.resumeImportedFields = user.resumeImportedFields
      }
      if (user.resumeImportVersion && !existing.resumeImportVersion) {
        updates.resumeImportVersion = user.resumeImportVersion
      }
      if (user.resumeImportedAt && !existing.resumeImportedAt) {
        updates.resumeImportedAt = user.resumeImportedAt
      }
      if (user.profileTipDismissed !== undefined && existing.profileTipDismissed === undefined) {
        updates.profileTipDismissed = user.profileTipDismissed
      }

      // Initialize favorites if missing
      if (!existing.favoriteDancers) {
        updates.favoriteDancers = []
      }
      if (!existing.favoriteChoreographers) {
        updates.favoriteChoreographers = []
      }

      // Update profile if there are changes
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates)
      }

      // Update user reference
      await ctx.db.patch(userId, {
        activeProfileType: 'dancer',
        activeDancerId: existing._id
      })

      // CRITICAL: Clean up deprecated fields from user
      await ctx.db.patch(userId, {
        profileType: undefined,
        displayName: undefined,
        location: undefined,
        searchPattern: undefined,
        onboardingCompleted: undefined,
        onboardingCompletedAt: undefined,
        onboardingVersion: undefined,
        currentOnboardingStep: undefined,
        currentOnboardingStepIndex: undefined,
        headshots: undefined,
        attributes: undefined,
        sizing: undefined,
        representation: undefined,
        representationStatus: undefined,
        links: undefined,
        sagAftraId: undefined,
        workLocation: undefined,
        training: undefined,
        resume: undefined,
        resumeImportedFields: undefined,
        resumeImportVersion: undefined,
        resumeImportedAt: undefined,
        profileTipDismissed: undefined,
        onboardingStep: undefined,
        pointsEarned: undefined
      })

      return {
        success: true,
        profileId: existing._id,
        message: `Profile existed, merged ${Object.keys(updates).length} fields and cleaned user`
      }
    }

    // Create dancer profile with all user data
    const profileId = await ctx.db.insert('dancers', {
      userId,
      isPrimary: true,
      createdAt: new Date().toISOString(),

      // Identity
      displayName: user.displayName,

      // Onboarding state
      onboardingCompleted: user.onboardingCompleted || false,
      onboardingCompletedAt: user.onboardingCompletedAt,
      onboardingVersion: user.onboardingVersion,
      currentOnboardingStep: user.currentOnboardingStep,
      currentOnboardingStepIndex: user.currentOnboardingStepIndex,

      // Profile data
      headshots: user.headshots,
      attributes: user.attributes,
      sizing: user.sizing,
      location: user.location,
      representation: user.representation,
      representationStatus: user.representationStatus,
      links: user.links,
      sagAftraId: user.sagAftraId,
      workLocation: user.workLocation,
      training: user.training,
      searchPattern: user.searchPattern || '',

      // Resume flattened
      projects: user.resume?.projects,
      skills: user.resume?.skills,
      genres: user.resume?.genres,
      resumeUploads: user.resume?.uploads,

      // Import tracking
      resumeImportedFields: user.resumeImportedFields,
      resumeImportVersion: user.resumeImportVersion,
      resumeImportedAt: user.resumeImportedAt,

      // Favorites (converted - will populate separately)
      favoriteDancers: [],
      favoriteChoreographers: [],

      profileCompleteness: 0,
      profileTipDismissed: user.profileTipDismissed
    })

    // Update user with profile reference
    await ctx.db.patch(userId, {
      activeProfileType: 'dancer',
      activeDancerId: profileId
    })

    // REMOVE DATA FROM USER (critical!)
    await ctx.db.patch(userId, {
      profileType: undefined,
      displayName: undefined,
      location: undefined,
      searchPattern: undefined,
      onboardingCompleted: undefined,
      onboardingCompletedAt: undefined,
      onboardingVersion: undefined,
      currentOnboardingStep: undefined,
      currentOnboardingStepIndex: undefined,
      headshots: undefined,
      attributes: undefined,
      sizing: undefined,
      representation: undefined,
      representationStatus: undefined,
      links: undefined,
      sagAftraId: undefined,
      workLocation: undefined,
      training: undefined,
      resume: undefined,
      resumeImportedFields: undefined,
      resumeImportVersion: undefined,
      resumeImportedAt: undefined,
      profileTipDismissed: undefined,
      onboardingStep: undefined, // Legacy field
      pointsEarned: undefined // Not in designs
    })

    return {
      success: true,
      profileId,
      message: 'Profile created and data migrated'
    }
  }
})

export const migrateAllUsers = internalMutation({
  args: {},
  returns: v.object({
    total: v.number(),
    migrated: v.number(),
    errors: v.number()
  }),
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    let migrated = 0
    let errors = 0

    for (const user of users) {
      try {
        const result = await ctx.runMutation(
          internal.migrations.migrateUsersToDancers.migrateUserToDancerProfile,
          { userId: user._id }
        )
        if (result.success) migrated++
      } catch (error) {
        console.error('Migration error for user', user._id, error)
        errors++
      }
    }

    return { total: users.length, migrated, errors }
  }
})
