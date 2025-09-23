import { internalAction, internalMutation } from '../_generated/server'
import { zInternalAction, zInternalMutation } from 'zodvex'
import { z } from 'zod'
import { internal } from '../_generated/api'

// Simple one-time migration - just migrate everyone at once
export const migrateAllUsers = zInternalMutation(
  internalMutation,
  {},
  async (ctx) => {
    const results = {
      migrated: [] as string[],
      alreadyMigrated: [] as string[],
      errors: [] as { userId: string; error: string }[],
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

      // Skip if already migrated
      if (user.activeDancerId || user.activeChoreographerId) {
        results.alreadyMigrated.push(user._id)
        continue
      }

      // Skip guests - they don't need profiles
      if (user.profileType === 'guest') {
        continue
      }

      try {
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
          await ctx.db.patch(user._id, {
            activeProfileType: 'dancer',
            activeDancerId: profileId
          })

          results.migrated.push(user._id)
          console.log(`✅ Migrated dancer: ${user.email}`)

        } else if (user.profileType === 'choreographer') {
          // Create choreographer profile
          const profileId = await ctx.db.insert('choreographers', {
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

          results.migrated.push(user._id)
          console.log(`✅ Migrated choreographer: ${user.email}`)
        }
      } catch (error: any) {
        console.error(`❌ Failed to migrate user ${user._id}:`, error)
        results.errors.push({
          userId: user._id,
          error: error.message || 'Unknown error'
        })
      }
    }

    return results
  },
  {
    returns: z.object({
      migrated: z.array(z.string()),
      alreadyMigrated: z.array(z.string()),
      errors: z.array(z.object({ userId: z.string(), error: z.string() })),
      totalProcessed: z.number()
    })
  }
)

// Action wrapper to run the migration
export const runMigration = zInternalAction(
  internalAction,
  {},
  async (ctx): Promise<any> => {
    console.log('🚀 Starting auto-migration...')

    const results: any = await ctx.runMutation(
      internal.migrations.autoMigrateAndCleanup.migrateAllUsers,
      {}
    )

    console.log('📊 Migration Results:')
    console.log(`  ✅ Migrated: ${results.migrated.length}`)
    console.log(`  ⏭️  Already migrated: ${results.alreadyMigrated.length}`)
    console.log(`  ❌ Errors: ${results.errors.length}`)
    console.log(`  📈 Total processed: ${results.totalProcessed}`)

    if (results.errors.length > 0) {
      console.error('Errors encountered:', results.errors)
    }

    return results
  },
  {
    returns: z.object({
      migrated: z.array(z.string()),
      alreadyMigrated: z.array(z.string()),
      errors: z.array(z.object({ userId: z.string(), error: z.string() })),
      totalProcessed: z.number()
    })
  }
)
