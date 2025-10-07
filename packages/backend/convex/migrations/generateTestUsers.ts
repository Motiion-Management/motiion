import { internalMutation } from '../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'

/**
 * Generate test users for migration testing
 * Creates users with various data states to test all migration scenarios
 */
export const generateTestUsers = internalMutation({
  args: {},
  returns: v.object({
    created: v.number(),
    userIds: v.array(v.id('users')),
    scenarios: v.array(v.string())
  }),
  handler: async (ctx) => {
    const userIds: Id<'users'>[] = []
    const scenarios: string[] = []

    // Scenario 1: Complete dancer with all fields (most common case)
    const completeUser = await ctx.db.insert('users', {
      tokenId: `test_complete_${Date.now()}`,
      type: 'member',
      isAdmin: false,
      email: 'complete.dancer@test.com',
      firstName: 'Complete',
      lastName: 'Dancer',
      fullName: 'Complete Dancer',
      phone: '+15555551001',
      dateOfBirth: '1995-06-15',

      // DEPRECATED: To be migrated
      profileType: 'dancer',
      displayName: 'CD Pro',
      onboardingCompleted: true,
      onboardingCompletedAt: '2025-01-15T10:30:00.000Z',
      onboardingVersion: 'v2',
      currentOnboardingStep: 'review',
      currentOnboardingStepIndex: 15,

      location: {
        city: 'Los Angeles',
        state: 'California',
        country: 'United States'
      },

      // Note: headshots omitted - would require actual file uploads
      // Migration should handle users with and without headshots

      attributes: {
        height: { feet: 5, inches: 8 },
        ethnicity: ['White / Caucasian', 'Hispanic / Latino'],
        hairColor: 'Brown',
        eyeColor: 'Green',
        gender: 'Male'
      },

      sizing: {
        general: {
          waist: '32',
          inseam: '32',
          glove: '9'
        },
        male: {
          shirt: 'M',
          shoes: '10'
        }
      },

      resume: {
        projects: [] as any[], // Will add project IDs separately
        skills: ['Ballet', 'Jazz', 'Contemporary', 'Hip Hop', 'Tap'],
        genres: ['Musical Theater', 'Pop', 'R&B']
        // Note: uploads omitted - would require actual file uploads
      },

      links: {
        reel: 'https://vimeo.com/test123',
        socials: {
          instagram: '@completedancer',
          tiktok: '@completedancer'
        }
      },

      sagAftraId: 'SAG-12345',
      workLocation: ['Los Angeles, California', 'New York, New York'],
      training: [] as any[], // Will add training IDs separately

      representation: {
        agencyId: undefined, // Would need to create agency first
        displayRep: true
      },
      representationStatus: 'seeking',

      searchPattern: 'Complete Dancer CD Pro Los Angeles California Ballet Jazz Contemporary',
      profileTipDismissed: true,
      pointsEarned: 100
    })
    userIds.push(completeUser)
    scenarios.push('Complete dancer with all fields')

    // Scenario 2: Partial dancer (some fields missing)
    const partialUser = await ctx.db.insert('users', {
      tokenId: `test_partial_${Date.now()}`,
      type: 'member',
      isAdmin: false,
      email: 'partial.dancer@test.com',
      firstName: 'Partial',
      lastName: 'Dancer',
      fullName: 'Partial Dancer',

      // DEPRECATED: Minimal data
      profileType: 'dancer',
      displayName: 'Partial D',
      onboardingCompleted: false,
      currentOnboardingStep: 'skills',
      currentOnboardingStepIndex: 8,

      location: {
        city: 'Chicago',
        state: 'Illinois',
        country: 'United States'
      },

      attributes: {
        height: { feet: 5, inches: 6 },
        gender: 'Female'
      },

      resume: {
        skills: ['Hip Hop', 'Contemporary']
      },

      searchPattern: 'Partial Dancer Chicago'
    })
    userIds.push(partialUser)
    scenarios.push('Partial dancer (incomplete onboarding)')

    // Scenario 3: Choreographer user
    const choreographerUser = await ctx.db.insert('users', {
      tokenId: `test_choreo_${Date.now()}`,
      type: 'member',
      isAdmin: false,
      email: 'choreo@test.com',
      firstName: 'Creative',
      lastName: 'Choreographer',
      fullName: 'Creative Choreographer',

      // DEPRECATED: Choreographer fields
      profileType: 'choreographer',
      displayName: 'CC Creative',
      onboardingCompleted: true,
      onboardingCompletedAt: '2025-01-20T14:00:00.000Z',
      onboardingVersion: 'v2',

      location: {
        city: 'New York',
        state: 'New York',
        country: 'United States'
      },

      // Note: headshots omitted - would require actual file uploads

      companyName: 'Creative Dance Company',
      databaseUse: 'casting',
      workLocation: ['New York, New York', 'Los Angeles, California'],

      resume: {
        projects: [] as any[],
        skills: ['Choreography', 'Dance Direction', 'Audition Coordination'],
        genres: ['Contemporary', 'Musical Theater']
      },

      links: {
        reel: 'https://vimeo.com/choreo456',
        socials: {
          instagram: '@creativechoreo'
        }
      },

      representationStatus: 'independent',
      searchPattern: 'Creative Choreographer New York'
    })
    userIds.push(choreographerUser)
    scenarios.push('Choreographer with company info')

    // Scenario 4: User with old onboarding state (legacy step field)
    const legacyUser = await ctx.db.insert('users', {
      tokenId: `test_legacy_${Date.now()}`,
      type: 'member',
      isAdmin: false,
      email: 'legacy@test.com',
      firstName: 'Legacy',
      lastName: 'User',
      fullName: 'Legacy User',

      // DEPRECATED: Old onboarding system
      profileType: 'dancer',
      onboardingStep: 'height', // Old field name
      onboardingCompleted: false,

      location: {
        city: 'Miami',
        state: 'Florida',
        country: 'United States'
      },

      searchPattern: 'Legacy User Miami'
    })
    userIds.push(legacyUser)
    scenarios.push('Legacy user with old onboarding field')

    // Scenario 5: User with pointsEarned (to be removed)
    const pointsUser = await ctx.db.insert('users', {
      tokenId: `test_points_${Date.now()}`,
      type: 'member',
      isAdmin: false,
      email: 'points@test.com',
      firstName: 'Points',
      lastName: 'User',
      fullName: 'Points User',

      // DEPRECATED
      profileType: 'dancer',
      displayName: 'Points P',
      onboardingCompleted: true,
      onboardingCompletedAt: '2025-01-05T10:00:00.000Z',

      location: {
        city: 'Austin',
        state: 'Texas',
        country: 'United States'
      },

      pointsEarned: 500, // Should be removed by migration
      searchPattern: 'Points User Austin'
    })
    userIds.push(pointsUser)
    scenarios.push('User with pointsEarned field to remove')

    // Scenario 6: Minimal user (just started)
    const minimalUser = await ctx.db.insert('users', {
      tokenId: `test_minimal_${Date.now()}`,
      type: 'member',
      isAdmin: false,
      email: 'minimal@test.com',
      firstName: 'Minimal',
      lastName: 'User',
      fullName: 'Minimal User',

      // DEPRECATED: Just profile type selected
      profileType: 'dancer',
      onboardingCompleted: false,
      currentOnboardingStep: 'profile-type',
      currentOnboardingStepIndex: 0
    })
    userIds.push(minimalUser)
    scenarios.push('Minimal user (just started onboarding)')

    // Create some projects for complete user
    const project1 = await ctx.db.insert('projects', {
      userId: completeUser,
      type: 'live-performance',
      subtype: 'theater',
      title: 'Broadway Show ABC',
      roles: ['Ensemble Dancer'],
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      venue: 'Broadway Theater',
      choreographers: ['Famous Choreographer'],
      private: false
    })

    const project2 = await ctx.db.insert('projects', {
      userId: completeUser,
      type: 'music-video',
      title: 'Music Video XYZ',
      roles: ['Featured Dancer'],
      artists: ['Major Artist'],
      productionCompany: 'Major Record Label',
      startDate: '2023-06-01',
      private: false
    })

    // Update complete user's resume with project IDs
    const completeUserData = await ctx.db.get(completeUser)
    if (completeUserData && completeUserData.resume) {
      await ctx.db.patch(completeUser, {
        resume: {
          ...completeUserData.resume,
          projects: [project1, project2]
        }
      })
    }

    // Create training for complete user
    const training1 = await ctx.db.insert('training', {
      userId: completeUser,
      type: 'education',
      institution: 'Juilliard School',
      degree: 'BFA Dance',
      startYear: 2015,
      endYear: 2019,
      orderIndex: 0
    })

    const training2 = await ctx.db.insert('training', {
      userId: completeUser,
      type: 'programs-intensives',
      institution: 'Alvin Ailey American Dance Theater',
      degree: 'Professional Certificate',
      startYear: 2020,
      endYear: 2021,
      orderIndex: 1
    })

    // Update complete user's training
    await ctx.db.patch(completeUser, {
      training: [training1, training2]
    })

    return {
      created: userIds.length,
      userIds,
      scenarios
    }
  }
})

/**
 * Clean up test users (for cleanup after testing)
 */
export const cleanupTestUsers = internalMutation({
  args: {},
  returns: v.object({
    usersDeleted: v.number(),
    profilesDeleted: v.number(),
    projectsDeleted: v.number(),
    trainingDeleted: v.number()
  }),
  handler: async (ctx) => {
    // Find all test users
    const allUsers = await ctx.db.query('users').collect()
    const testUsers = allUsers.filter(u => u.tokenId.startsWith('test_'))

    let profilesDeleted = 0
    let projectsDeleted = 0
    let trainingDeleted = 0

    for (const user of testUsers) {
      // Delete associated profiles
      if (user.activeDancerId) {
        await ctx.db.delete(user.activeDancerId)
        profilesDeleted++
      }
      if (user.activeChoreographerId) {
        await ctx.db.delete(user.activeChoreographerId)
        profilesDeleted++
      }

      // Delete associated projects
      const projects = await ctx.db
        .query('projects')
        .filter(q => q.eq(q.field('userId'), user._id))
        .collect()
      for (const project of projects) {
        await ctx.db.delete(project._id)
        projectsDeleted++
      }

      // Delete associated training
      const training = await ctx.db
        .query('training')
        .filter(q => q.eq(q.field('userId'), user._id))
        .collect()
      for (const trainingRecord of training) {
        await ctx.db.delete(trainingRecord._id)
        trainingDeleted++
      }

      // Delete user
      await ctx.db.delete(user._id)
    }

    return {
      usersDeleted: testUsers.length,
      profilesDeleted,
      projectsDeleted,
      trainingDeleted
    }
  }
})
