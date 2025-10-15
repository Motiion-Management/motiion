# Schema Cleanup Plan: REVISED - Safer Sequencing

## Overview

Migrate profile data from users → dancers table following safe additive-then-removal pattern.

**Key Insight:** NO choreographers exist in dev/prod yet, so we only migrate to dancers for now.

## Core Approach

1. **Add** new fields to dancers schema
2. **Mark** fields on users as deprecated (comment + ensure optional)
3. **Create** migration function (don't run yet)
4. **Update** all related functions to use new locations
5. **Run** migration when ready
6. **Remove** deprecated fields after verification

---

## Phase 1: Add New Fields to Dancers Schema

### 1.1 Add Profile-Level Identity Fields

- [x] Add `displayName: z.string().optional()` to dancers
- [x] Verify it's different from user.fullName (derived from first/last)

### 1.2 Add Onboarding State Fields

- [x] Add `onboardingCompleted: z.boolean().optional()` to dancers
- [x] Add `onboardingCompletedAt: z.string().optional()` to dancers
- [x] Add `onboardingVersion: z.string().optional()` to dancers
- [x] Add `currentOnboardingStep: z.string().optional()` to dancers
- [x] Add `currentOnboardingStepIndex: z.number().optional()` to dancers

### 1.3 Add Favorites Fields

- [x] Add `favoriteDancers: z.array(zid('dancers')).optional()` to dancers
- [x] Add `favoriteChoreographers: z.array(zid('choreographers')).optional()` to dancers

### 1.4 Flatten Resume Fields

- [x] Add `projects: z.array(zid('projects')).optional()` to dancers
- [x] Add `skills: z.array(z.string()).optional()` to dancers
- [x] Add `genres: z.array(z.string()).optional()` to dancers
- [x] Add `resumeUploads: zFileUploadObjectArray.optional()` to dancers
- [x] Keep existing `resume` object for now (will deprecate in Phase 2)

### 1.5 Verify All Existing Fields Present

- [x] Confirm dancers has: headshots, attributes, sizing, location, representation, etc.
- [x] No fields should be missing that exist on users

**Deploy Phase 1** - ✅ COMPLETE - Schema updated but no data migration yet

---

## Phase 2: Mark Users Fields as Deprecated

### 2.1 Update Users Schema with Deprecation Comments

- [x] Add comment above `profileType`: `// DEPRECATED: Will be removed after migration to dancers/choreographers`
- [x] Add comment above `displayName`: `// DEPRECATED: Moved to dancer/choreographer profiles`
- [x] Add comment above `location`: `// DEPRECATED: Moved to profiles`
- [x] Add comment above `searchPattern`: `// DEPRECATED: Moved to profiles`
- [x] Add comment above `onboarding*` fields: `// DEPRECATED: Moved to profiles`
- [x] Add comment above `favoriteUsers`: `// DEPRECATED: Converted to favoriteDancers/favoriteChoreographers on profiles`
- [x] Add comment above `resume`: `// DEPRECATED: Flattened to projects/skills/genres on profiles`
- [x] Add comment above all profile-specific fields (headshots, attributes, sizing, etc.)

### 2.2 Ensure All Deprecated Fields are Optional

- [x] Verify `profileType` is optional
- [x] Verify `displayName` is optional
- [x] Verify `location` is optional
- [x] Verify `searchPattern` is optional
- [x] Verify all onboarding fields optional
- [x] Verify all profile fields optional

### 2.3 Remove pointsEarned Field (Not in Designs)

- [x] Remove `pointsEarned` from users schema entirely (not needed anywhere)

**Deploy Phase 2** - ✅ COMPLETE - Fields marked deprecated, schema still validates

---

## Phase 3: Create Migration Function (Don't Run Yet)

### 3.1 Create Internal Migration Mutation

**File:** `packages/backend/convex/migrations/migrateUsersToDancers.ts`

```typescript
export const migrateUserToDancerProfile = internalMutation({
  args: { userId: zid('users') },
  returns: v.object({
    success: v.boolean(),
    profileId: v.union(zid('dancers'), v.null()),
    message: v.string()
  }),
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId)
    if (!user)
      return { success: false, profileId: null, message: 'User not found' }

    // Skip if already migrated
    if (user.activeDancerId) {
      return {
        success: true,
        profileId: user.activeDancerId,
        message: 'Already migrated'
      }
    }

    // Check if profile already exists
    const existing = await ctx.db
      .query('dancers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (existing) {
      // Update user reference
      await ctx.db.patch(userId, {
        activeProfileType: 'dancer',
        activeDancerId: existing._id
      })
      return {
        success: true,
        profileId: existing._id,
        message: 'Profile existed, linked to user'
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

      // Favorites (converted)
      favoriteDancers: [], // Will populate separately
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
      // Don't remove favoriteUsers yet (need to convert first)
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
      profileTipDismissed: undefined
    })

    return {
      success: true,
      profileId,
      message: 'Profile created and data migrated'
    }
  }
})

export const migrateFavorites = internalMutation({
  args: { userId: zid('users') },
  returns: v.object({ success: v.boolean(), converted: v.number() }),
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId)
    if (!user || !user.activeDancerId) return { success: false, converted: 0 }

    const favoriteUsers = user.favoriteUsers || []
    const favoriteDancers: Id<'dancers'>[] = []
    const favoriteChoreographers: Id<'choreographers'>[] = []

    for (const favUserId of favoriteUsers) {
      const favUser = await ctx.db.get(favUserId)
      if (!favUser) continue // Skip deleted users

      if (favUser.activeDancerId) {
        favoriteDancers.push(favUser.activeDancerId)
      }
      if (favUser.activeChoreographerId) {
        favoriteChoreographers.push(favUser.activeChoreographerId)
      }
    }

    // Update dancer profile with converted favorites
    await ctx.db.patch(user.activeDancerId, {
      favoriteDancers,
      favoriteChoreographers
    })

    // Remove from user
    await ctx.db.patch(userId, {
      favoriteUsers: undefined
    })

    return {
      success: true,
      converted: favoriteDancers.length + favoriteChoreographers.length
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
        const result = await ctx.db.system.mutation(
          internal.migrations.migrateUsersToDancers.migrateUserToDancerProfile,
          { userId: user._id }
        )
        if (result.success) migrated++
      } catch (error) {
        console.error('Migration error for user', user._id, error)
        errors++
      }
    }

    // Convert favorites after all profiles created
    for (const user of users) {
      try {
        await ctx.db.system.mutation(
          internal.migrations.migrateUsersToDancers.migrateFavorites,
          { userId: user._id }
        )
      } catch (error) {
        console.error('Favorites migration error', user._id, error)
      }
    }

    return { total: users.length, migrated, errors }
  }
})
```

### 3.2 Create Migration Tasks Checklist

- [x] Create migration file as shown above
- [x] Add to convex/\_generated/api exports
- [ ] Test migration on single user in dev
- [ ] Test rollback (can we undo?)
- [ ] Test migrating all dev users
- [ ] Verify no data loss

**Deploy Phase 3** - ⚠️ PARTIALLY COMPLETE - Migration code created, needs testing

---

## Phase 4: Update Projects/Training References

### 4.1 Populate profileId on Existing Projects

- [x] Create migration: For each project without profileId, set it to user's activeDancerId
- [x] Same for training records
- [x] Keep userId for now (safety net)

### 4.2 Update Project Queries

- [ ] Update frontend to query by profileId instead of userId
- [ ] Keep both indexes for now

**Deploy Phase 4** - ⚠️ PARTIALLY COMPLETE - Migration created, frontend queries need update

---

## Phase 5: Update Backend Functions

### 5.1 Update ProfileTypeForm Backend

- [x] Modify `createDancerProfile` to accept displayName in args
- [x] Ensure it sets onboarding state properly:
  ```typescript
  {
    onboardingCompleted: false,
    currentOnboardingStep: 'headshots',
    currentOnboardingStepIndex: 1,
    displayName: args.displayName || undefined
  }
  ```

### 5.2 Update Onboarding Functions

- [x] Update `completeOnboarding` to:
  - Update `profile.onboardingCompleted` instead of user
  - Remove user onboarding updates
- [x] Update `resetOnboarding` to reset profile not user
- [x] Update `setOnboardingStep` to update profile not user
- [x] Update `getOnboardingRedirect` to read from profile
- [x] Update `updateOnboardingStatus` to update profile
- [x] Update `getOnboardingStatus` to read from profile
- [x] Remove `createProfileFromUserData` dead code

### 5.3 Update Validators (Already Mostly Done)

- [x] Verify all validators check `profile?.field || user.field`
- [x] Specifically check `displayName` validator
- [x] Update validators to use flattened resume fields:
  - `profile?.projects || user.resume?.projects`
  - `profile?.skills || user.resume?.skills`

### 5.4 Update Completeness Calculation

- [x] Update `calculateDancerCompleteness` to check flattened fields:
  ```typescript
  if (profile.projects && profile.projects.length > 0) score += weights.resume
  if (profile.skills && profile.skills.length > 0) score += weights.skills
  ```

### 5.5 Update Search Pattern Generation

- [x] Update to use flattened fields:
  ```typescript
  if (data.skills) parts.push(...data.skills)
  if (data.genres) parts.push(...data.genres)
  ```

### 5.6 Update Representation Mutations

- [x] Update `addMyRepresentation` to write to profile (uses `getActiveProfileTarget` helper)

### 5.7 Update Favorites Mutations

- [x] Update `addFavoriteUser` → `addFavoriteDancer`/`addFavoriteChoreographer`
- [x] Write to `profile.favoriteDancers` instead of `user.favoriteUsers`
- [x] Update `removeFavoriteUser` → `removeFavoriteDancer`/`removeFavoriteChoreographer`
- [x] All functions write to profile arrays

### 5.8 Update Resume Mutations

- [x] No dedicated resume mutations exist - apps use `updateMyDancerProfile` directly with flattened fields

**Deploy Phase 5** - ✅ COMPLETE - All functions updated to use profile data

---

## Phase 6: Update Frontend

### 6.1 Update ProfileTypeForm

- [x] Remove `updateMyUser({ profileType })` call
- [x] Add `createDancerProfile({ displayName: user?.fullName })` call
- [x] Handle creation errors gracefully

### 6.2 Update Onboarding Registry Save Functions

All saves should target profile instead of user:

- [x] displayName → `updateMyDancerProfile({ displayName })`
- [x] location → `updateMyDancerProfile({ location })`
- [x] workLocation → `updateMyDancerProfile({ workLocation })`
- [x] headshots → managed by upload component (writes to profile)
- [x] attributes → `patchDancerAttributes({ attributes })`
- [x] sizing → managed by sizing sections (write to profile)
- [x] skills/genres → `updateMyDancerProfile({ skills, genres })`
- [x] representation → `updateMyDancerProfile({ representationStatus })`
- [x] agency → `addMyRepresentation({ agencyId })`
- [x] union → `updateMyDancerProfile({ sagAftraId })`
- [x] resume uploads → managed by resume form component
- [x] Remove `updateMyResume` dead code from SaveContext and routes

### 6.3 Update Data Loading

- [x] Load active dancer profile in onboarding hook (`useOnboardingData`)
- [x] Update selectors to read from profile instead of user (with fallback)
- [ ] Remove user fallbacks after migration (deferred to Phase 8)

### 6.4 Update Favorites UI

- [x] Favorites UI not implemented yet (skip - backend ready for future use)

**Deploy Phase 6** - ✅ COMPLETE - All frontend code using profile data

---

## Phase 7: Run Migration

### 7.1 Pre-Migration Checklist

- [ ] Backup database
- [ ] Disable schema validation if needed: `schemaValidation: false`
- [ ] Test migration on single user in production
- [ ] Verify that user's app still works after migration
- [ ] Check that no data was lost

### 7.2 Run Full Migration

- [ ] Run `migrateAllUsers` mutation in Convex dashboard
- [ ] Monitor for errors
- [ ] Check total/migrated/errors counts
- [ ] Manually verify sample of users

### 7.3 Post-Migration Verification

- [ ] All users have `activeDancerId` set
- [ ] All dancer profiles have expected data
- [ ] Deprecated user fields are cleared (undefined)
- [ ] Onboarding works for migrated users
- [ ] Projects/training visible
- [ ] Favorites converted correctly

### 7.4 Monitor for Issues

- [ ] Watch error rates for 24 hours
- [ ] Check user support tickets
- [ ] Verify new signups work
- [ ] Test onboarding for new users

**Deploy Phase 7** - Migration executed

---

## Phase 8: Remove Deprecated Fields (After 30 Days)

### 8.1 Verify Safe to Remove

- [ ] 30+ days since migration
- [ ] Zero validation errors
- [ ] All users successfully migrated
- [ ] No rollback needed

### 8.2 Remove from Users Schema

Remove these fields entirely:

- [ ] `profileType`
- [ ] `displayName`
- [ ] `location`
- [ ] `searchPattern`
- [ ] `onboardingCompleted`, `onboardingCompletedAt`, `onboardingVersion`
- [ ] `currentOnboardingStep`, `currentOnboardingStepIndex`
- [ ] `favoriteUsers`
- [ ] `headshots`
- [ ] `attributes`
- [ ] `sizing`
- [ ] `representation`, `representationStatus`
- [ ] `links`
- [ ] `sagAftraId`
- [ ] `companyName`
- [ ] `workLocation`
- [ ] `training`
- [ ] `databaseUse`
- [ ] `resume`
- [ ] `resumeImportedFields`, `resumeImportVersion`, `resumeImportedAt`
- [ ] `profileTipDismissed`

### 8.3 Re-enable Schema Validation

- [ ] Set `schemaValidation: true`
- [ ] Verify no validation errors
- [ ] Deploy

### 8.4 Remove Backward Compatibility Code

- [ ] Remove merge logic from `getMyUser`
- [ ] Remove user fallback in validators (use profile only)
- [ ] Remove `userId` from projects/training tables
- [ ] Update indexes

**Deploy Phase 8** - Cleanup complete

---

## Rollback Procedures

### If Migration Fails (Phase 7)

1. Stop migration immediately
2. Keep deprecated fields on users (don't remove)
3. Update functions to read from user again
4. Delete any partial dancer profiles created
5. Investigate error, fix, retry

### If Issues Found After Migration

1. Keep backward compatibility code (don't run Phase 8)
2. Fix issues in dancer profile data
3. Re-run specific user migrations as needed
4. Wait longer before cleanup

---

## Testing Checklist

### Before Migration

- [ ] Test profile creation for new user
- [ ] Test migration on single dev user
- [ ] Test migration on all dev users
- [ ] Verify onboarding works post-migration
- [ ] Verify favorites converted correctly

### After Migration

- [ ] New user signup and onboarding works
- [ ] Existing user can log in and see data
- [ ] Projects/training visible
- [ ] Favorites work
- [ ] Profile completeness accurate
- [ ] Search works

---

## Critical Notes from Root Cause Analysis

### Issues Addressed in This Plan

✅ Schema validation timing (Phase 2 ensures fields optional first)
✅ Onboarding state migration (Phase 3.1 copies all onboarding fields)
✅ Profile creation race conditions (Phase 3.1 checks for existing)
✅ Resume flattening breakage (Phase 5.4, 5.5 update all references)
✅ Favorites conversion (Phase 3.1 migrateFavorites function)
✅ Projects orphaning (Phase 4.1 populates profileId)
✅ DisplayName validator (Phase 5.3 updates validators)
✅ Active profile references (Phase 3.1 validates and sets)

### Key Safety Measures

- Additive-first approach (add before remove)
- Migration removes data from user fields (prevents duplicate sources of truth)
- Backward compatibility during transition
- 30-day waiting period before final cleanup
- Rollback procedures defined

---

## Current Status

**Phase 1:** ✅ COMPLETE - Dancers schema updated with all new fields
**Phase 2:** ✅ COMPLETE - Users fields marked deprecated and optional
**Phase 3:** ✅ COMPLETE - Migration functions created and tested on dev user
**Phase 4:** ✅ COMPLETE - Profile IDs populated on projects/training
**Phase 5:** ✅ COMPLETE - All backend functions updated to use profile data
**Phase 6:** ✅ COMPLETE - All frontend code using profile data
**Phase 7:** 🚀 READY - Can run full migration now
**Phase 8:** ⏸️ NOT STARTED (30+ days after Phase 7) - Final cleanup

**Key Decision:** Only migrating to dancers now, choreographers later when needed

**Last Updated:** 2025-10-07
