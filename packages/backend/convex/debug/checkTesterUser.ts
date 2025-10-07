import { internalQuery } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Debug query to check if dancer profile was created for user with firstName "Tester"
 */
export const checkTesterUser = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    // Find user with firstName "Tester"
    const users = await ctx.db.query('users').collect()
    const testerUser = users.find((u) => u.firstName === 'Tester')

    if (!testerUser) {
      return { error: 'No user found with firstName "Tester"' }
    }

    // Check if they have an activeDancerId or activeChoreographerId
    const result: any = {
      user: {
        _id: testerUser._id,
        email: testerUser.email,
        firstName: testerUser.firstName,
        lastName: testerUser.lastName,
        profileType: testerUser.profileType,
        activeProfileType: testerUser.activeProfileType,
        activeDancerId: testerUser.activeDancerId,
        activeChoreographerId: testerUser.activeChoreographerId
      }
    }

    // If they have a dancer profile, fetch it
    if (testerUser.activeDancerId) {
      const dancerProfile = await ctx.db.get(testerUser.activeDancerId)
      result.dancerProfile = dancerProfile
        ? {
            _id: dancerProfile._id,
            userId: dancerProfile.userId,
            displayName: dancerProfile.displayName,
            isPrimary: dancerProfile.isPrimary,
            createdAt: dancerProfile.createdAt,
            onboardingCompleted: dancerProfile.onboardingCompleted,
            currentOnboardingStep: dancerProfile.currentOnboardingStep
          }
        : null
    }

    // If they have a choreographer profile, fetch it
    if (testerUser.activeChoreographerId) {
      const choreoProfile = await ctx.db.get(testerUser.activeChoreographerId)
      result.choreographerProfile = choreoProfile
        ? {
            _id: choreoProfile._id,
            userId: choreoProfile.userId,
            displayName: choreoProfile.displayName,
            isPrimary: choreoProfile.isPrimary,
            createdAt: choreoProfile.createdAt,
            onboardingCompleted: choreoProfile.onboardingCompleted,
            currentOnboardingStep: choreoProfile.currentOnboardingStep
          }
        : null
    }

    return result
  }
})
