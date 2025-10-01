import { internalAction, internalMutation } from '../_generated/server'
import { zInternalAction, zInternalMutation } from '@packages/zodvex'
import { z } from 'zod'
import { internal } from '../_generated/api'

// Helper to verify data was copied correctly
function verifyFieldsMatch(
  userValue: any,
  profileValue: any,
  fieldName: string
): boolean {
  // Both undefined/null is OK
  if ((userValue === undefined || userValue === null) &&
      (profileValue === undefined || profileValue === null)) {
    return true
  }

  // If one is defined and the other isn't, that's a mismatch
  if ((userValue === undefined || userValue === null) !==
      (profileValue === undefined || profileValue === null)) {
    console.warn(`⚠️ Field ${fieldName} mismatch: user has ${userValue}, profile has ${profileValue}`)
    return false
  }

  // For objects/arrays, do deep comparison
  const userStr = JSON.stringify(userValue)
  const profileStr = JSON.stringify(profileValue)

  if (userStr !== profileStr) {
    console.warn(`⚠️ Field ${fieldName} mismatch: user has ${userStr}, profile has ${profileStr}`)
    return false
  }

  return true
}

// Enhanced migration with verification and cleanup
export const migrateAllUsers = zInternalMutation(
  internalMutation,
  {},
  async (ctx) => {
    const results = {
      migrated: [] as string[],
      alreadyMigrated: [] as string[],
      verified: [] as string[],
      cleaned: [] as string[],
      errors: [] as { userId: string; error: string; step: string }[],
      totalProcessed: 0
    }

    // Get ALL users with profileType
    const users = await ctx.db
      .query('users')
      .filter((q) =>
        q.neq(q.field('profileType'), undefined)
      )
      .collect()

    console.log(`📊 Found ${users.length} users with profileType`)

    for (const user of users) {
      results.totalProcessed++

      // Skip guests - they don't need profiles
      if (user.profileType === 'guest') {
        continue
      }

      try {
        // Check if already migrated
        const hasActiveProfile = user.activeDancerId || user.activeChoreographerId

        if (hasActiveProfile) {
          results.alreadyMigrated.push(user._id)

          // Verify and cleanup existing migrations
          let profileId: any = null
          let profileType: 'dancer' | 'choreographer' | null = null

          if (user.activeDancerId) {
            profileId = user.activeDancerId
            profileType = 'dancer'
          } else if (user.activeChoreographerId) {
            profileId = user.activeChoreographerId
            profileType = 'choreographer'
          }

          if (profileId && profileType) {
            const profile = await ctx.db.get(profileId)

            if (profile) {
              // Verify data matches
              const fieldsToVerify = profileType === 'dancer'
                ? ['headshots', 'representation', 'representationStatus', 'attributes', 'sizing', 'resume', 'links', 'sagAftraId', 'training', 'workLocation', 'location', 'profileTipDismissed', 'resumeImportedFields', 'resumeImportVersion', 'resumeImportedAt', 'searchPattern']
                : ['headshots', 'representation', 'representationStatus', 'resume', 'links', 'companyName', 'workLocation', 'location', 'databaseUse', 'profileTipDismissed', 'resumeImportedFields', 'resumeImportVersion', 'resumeImportedAt', 'searchPattern']

              let allMatch = true
              for (const field of fieldsToVerify) {
                if (!verifyFieldsMatch((user as any)[field], (profile as any)[field], field)) {
                  allMatch = false
                }
              }

              if (allMatch) {
                results.verified.push(user._id)

                // Clean up user table by removing duplicated fields
                const cleanupPatch: any = {}
                for (const field of fieldsToVerify) {
                  cleanupPatch[field] = undefined
                }

                await ctx.db.patch(user._id, cleanupPatch)
                results.cleaned.push(user._id)
                console.log(`🧹 Cleaned up ${profileType} profile data for: ${user.email}`)
              } else {
                console.error(`❌ Verification failed for user ${user._id}`)
                results.errors.push({
                  userId: user._id,
                  error: 'Data verification failed',
                  step: 'verification'
                })
              }
            }
          }
          continue
        }

        // Create new profile for unmigrated users
        if (user.profileType === 'dancer') {
          // Create dancer profile
          const profileId = await ctx.db.insert('dancers', {
            userId: user._id,
            isPrimary: true,
            createdAt: new Date().toISOString(),

            // Copy all profile data
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
          const dancerPatch: any = {
            activeProfileType: 'dancer',
            activeDancerId: profileId
          }
          await ctx.db.patch(user._id, dancerPatch)

          // Verify the data was copied correctly
          const profile = await ctx.db.get(profileId)
          if (!profile) {
            throw new Error('Profile creation failed')
          }

          const dancerFields = ['headshots', 'representation', 'representationStatus', 'attributes', 'sizing', 'resume', 'links', 'sagAftraId', 'training', 'workLocation', 'location', 'profileTipDismissed', 'resumeImportedFields', 'resumeImportVersion', 'resumeImportedAt', 'searchPattern']
          let allMatch = true
          for (const field of dancerFields) {
            if (!verifyFieldsMatch((user as any)[field], (profile as any)[field], field)) {
              allMatch = false
            }
          }

          if (!allMatch) {
            throw new Error('Data verification failed after migration')
          }

          results.verified.push(user._id)

          // Clean up user table
          const cleanupPatch: any = {}
          for (const field of dancerFields) {
            cleanupPatch[field] = undefined
          }
          await ctx.db.patch(user._id, cleanupPatch)
          results.cleaned.push(user._id)

          results.migrated.push(user._id)
          console.log(`✅ Migrated, verified, and cleaned dancer: ${user.email}`)

        } else if (user.profileType === 'choreographer') {
          // Create choreographer profile
          const choreoData: any = {
            userId: user._id,
            isPrimary: true,
            createdAt: new Date().toISOString(),

            // Copy all profile data
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
          }
          const profileId = await ctx.db.insert('choreographers', choreoData)

          // Update user with profile references
          const choreoPatch: any = {
            activeProfileType: 'choreographer',
            activeChoreographerId: profileId
          }
          await ctx.db.patch(user._id, choreoPatch)

          // Verify the data was copied correctly
          const profile = await ctx.db.get(profileId)
          if (!profile) {
            throw new Error('Profile creation failed')
          }

          const choreoFields = ['headshots', 'representation', 'representationStatus', 'resume', 'links', 'companyName', 'workLocation', 'location', 'databaseUse', 'profileTipDismissed', 'resumeImportedFields', 'resumeImportVersion', 'resumeImportedAt', 'searchPattern']
          let allMatch = true
          for (const field of choreoFields) {
            if (!verifyFieldsMatch((user as any)[field], (profile as any)[field], field)) {
              allMatch = false
            }
          }

          if (!allMatch) {
            throw new Error('Data verification failed after migration')
          }

          results.verified.push(user._id)

          // Clean up user table
          const cleanupPatch: any = {}
          for (const field of choreoFields) {
            cleanupPatch[field] = undefined
          }
          await ctx.db.patch(user._id, cleanupPatch)
          results.cleaned.push(user._id)

          results.migrated.push(user._id)
          console.log(`✅ Migrated, verified, and cleaned choreographer: ${user.email}`)
        }
      } catch (error: any) {
        console.error(`❌ Failed to migrate user ${user._id}:`, error)
        results.errors.push({
          userId: user._id,
          error: error.message || 'Unknown error',
          step: 'migration'
        })
      }
    }

    return results
  },
  { returns: z.any() }
)

// Action wrapper to run the migration
export const runMigration = zInternalAction(
  internalAction,
  {},
  async (ctx): Promise<any> => {
    console.log('🚀 Starting auto-migration with verification and cleanup...')

    const results: any = await ctx.runMutation(
      internal.migrations.autoMigrateAndCleanup.migrateAllUsers,
      {}
    )

    console.log('📊 Migration Results:')
    console.log(`  ✅ Migrated: ${results.migrated.length}`)
    console.log(`  ⏭️  Already migrated: ${results.alreadyMigrated.length}`)
    console.log(`  ✓  Verified: ${results.verified.length}`)
    console.log(`  🧹 Cleaned: ${results.cleaned.length}`)
    console.log(`  ❌ Errors: ${results.errors.length}`)
    console.log(`  📈 Total processed: ${results.totalProcessed}`)

    if (results.errors.length > 0) {
      console.error('Errors encountered:', results.errors)
    }

    return results
  },
  { returns: z.any() }
)

