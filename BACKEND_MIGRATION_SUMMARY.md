# Backend Migration Summary: Profile-Specific Updates

## Overview

Successfully aligned backend to use profile-specific tables (`dancers`, `choreographers`) instead of branching on `profileType`. All profile data now updates the correct table without conditional logic.

## Changes Made

### 1. Choreographer Mutations Completed ✅

**File:** `packages/backend/convex/choreographers.ts`

Added missing choreographer mutations to achieve parity with dancers:

- **`updateChoreographerProfile`** (lines 87-109)
  - Updates any choreographer profile by ID with ownership verification
  - Args: `{ profileId, updates }`
  - Returns: `{ success: boolean }`

- **`setActiveChoreographerProfile`** (lines 112-131)
  - Sets a choreographer profile as the user's active profile
  - Updates discriminate values on users table
  - Args: `{ profileId }`
  - Returns: `{ success: boolean }`

- **`updateMyChoreographerProfile`** (lines 138-159)
  - Updates the authenticated user's active choreographer profile
  - No profile ID needed - uses `ctx.user.activeChoreographerId`
  - Args: `zChoreographers.partial()`
  - Returns: `null`

- **`searchChoreographers`** (lines 162-177)
  - Public search function for choreographers
  - Uses search index on searchPattern field
  - Args: `{ searchTerm, limit? }`

- **`calculateChoreographerCompleteness`** (lines 180-227)
  - Calculates profile completeness percentage (0-100)
  - Different weights than dancers (no sizing/attributes)
  - Updates `profileCompleteness` field on the profile

### 2. Profile Creation Consolidated ✅

**File:** `packages/backend/convex/onboarding.ts`

Eliminated profileType branching by extracting to helper function:

- **Removed:** 80+ lines of duplicated if/else logic (lines 38-122)
- **Added:** `createProfileFromUserData()` helper (lines 299-382)
  - Single function handles both dancer and choreographer creation
  - Checks for existing profile before creating
  - Sets appropriate `activeProfileType` and profile ID on user
  - Maintains all migration logic in one place

**Benefits:**

- No more profileType branching in `completeOnboarding`
- Easier to test and maintain
- Clear separation of concerns
- Easy to add new profile types in future

### 3. Validators Updated to Use Active Profile ✅

**File:** `packages/backend/convex/onboardingConfig.ts`

Updated all step validators to check active profile data:

- **Type signature changed:** `(user) => boolean` → `(user, profile?) => boolean` (line 360)
- **All validators updated** (lines 364-463):
  - Check `profile?.field || user.field` pattern
  - Profile data takes priority
  - User data is fallback for backward compatibility
  - Works for both dancer and choreographer profiles

- **`isStepComplete` updated** (lines 466-473)
  - Now accepts optional `profile` parameter
  - Passes profile to validator functions

- **`getFlowCompletionStatus` updated** (lines 476-510)
  - Now accepts optional `profile` parameter
  - Uses profile data for all validations
  - Returns accurate completion status based on active profile

### 4. Onboarding Functions Updated ✅

**File:** `packages/backend/convex/onboarding.ts`

Updated all functions that use validators to fetch and pass active profile:

- **`updateOnboardingStatus`** (lines 164-226)
  - Fetches active profile based on `activeProfileType`
  - Passes profile to `getFlowCompletionStatus`

- **`getOnboardingStatus`** (lines 229-276)
  - Fetches active profile based on `activeProfileType`
  - Passes profile to `getFlowCompletionStatus`

- **`checkStepCompletion`** (lines 279-306)
  - Fetches active profile based on `activeProfileType`
  - Passes profile to `isStepComplete`

### 5. Users Mutations Cleaned ✅

**File:** `packages/backend/convex/users/users.ts`

Updated `updateMyUser` to clearly indicate account-level vs profile-level fields:

- **Added comprehensive documentation** (lines 175-181)
  - Explains what should be updated where
  - Points to correct profile mutations

- **Organized args by purpose** (lines 183-218)
  - Account-level fields (name, email, phone, etc.)
  - Onboarding state fields
  - DEPRECATED profile fields (with migration notes)

- **Added migration TODOs** (lines 234-240)
  - Future sync to active profile
  - Gradual removal of deprecated fields

## Architecture Improvements

### Before: Branching Logic ❌

```typescript
// Old pattern - branching everywhere
if (user.profileType === 'dancer') {
  // Create dancer profile
  const profileId = await ctx.db.insert('dancers', { ... })
  await ctx.db.patch(user._id, { activeDancerId: profileId })
} else if (user.profileType === 'choreographer') {
  // Create choreographer profile
  const profileId = await ctx.db.insert('choreographers', { ... })
  await ctx.db.patch(user._id, { activeChoreographerId: profileId })
}
```

### After: Unified Pattern ✅

```typescript
// New pattern - single code path
await createProfileFromUserData(ctx, user)

// Or use discriminate values
if (ctx.user.activeProfileType === 'dancer') {
  await ctx.updateMyDancerProfile(updates)
} else if (ctx.user.activeProfileType === 'choreographer') {
  await ctx.updateMyChoreographerProfile(updates)
}
```

## Data Flow

### Old Flow (DEPRECATED)

```
Frontend → updateMyUser → users table
                        ↓
                  (validation checks users table)
```

### New Flow (CURRENT)

```
Frontend → profile mutation → dancers/choreographers table
                             ↓
                       (validation checks active profile)
```

### Future Flow (TARGET)

```
Frontend → smart router → active profile mutation
                        ↓
                  dancers/choreographers table
                        ↓
                  (validation uses profile only)
```

## Migration Status

### ✅ Backend Complete

- [x] Choreographer mutations implemented
- [x] Profile creation consolidated
- [x] Validators use active profile
- [x] Users mutations cleaned
- [x] Type checking passes
- [x] Documentation complete

### 🔄 Frontend Pending

See `FRONTEND_MIGRATION_GUIDE.md` for details:

- [ ] Update OnboardingData interface
- [ ] Update data loading to fetch active profile
- [ ] Update selectors to read from profile
- [ ] Update SaveContext interface
- [ ] Update registry save functions
- [ ] Test both profile types end-to-end

### 🚀 Future Cleanup

- [ ] Remove backward compatibility from validators
- [ ] Reject profile fields in updateMyUser
- [ ] Remove deprecated fields from users schema
- [ ] Remove merge logic from getMyUser
- [ ] Auto-sync remaining user data to profiles

## Testing Recommendations

### Unit Tests

1. Test `createProfileFromUserData` with both profile types
2. Test validators with profile data
3. Test validators with user fallback data
4. Test choreographer mutations

### Integration Tests

1. Complete onboarding flow as dancer
2. Complete onboarding flow as choreographer
3. Verify data lands in correct tables
4. Verify validators show correct progress

### Edge Cases

1. User with profileType but no active profile (migration case)
2. User with both profileType and active profile (normal case)
3. Switching between dancer and choreographer profiles
4. Missing profile data during validation

## Key Files Modified

1. **packages/backend/convex/choreographers.ts** - Added missing mutations
2. **packages/backend/convex/onboarding.ts** - Consolidated profile creation
3. **packages/backend/convex/onboardingConfig.ts** - Updated validators
4. **packages/backend/convex/users/users.ts** - Cleaned mutations

## Breaking Changes

### None for Existing Users ✅

- Backward compatibility maintained
- User table data still works as fallback
- `getMyUser` merges profile data for compatibility

### For New Development

- Use `patchDancerAttributes` instead of `updateMyUser` for attributes
- Use `updateMyDancerProfile` instead of `updateMyUser` for profile fields
- Use `updateMyChoreographerProfile` for choreographer-specific fields

## Next Steps

1. **Review this summary** - Ensure understanding of changes
2. **Review frontend guide** - Plan frontend migration
3. **Update frontend incrementally** - Start with OnboardingData
4. **Test thoroughly** - Both profile types
5. **Monitor production** - Watch for any issues
6. **Plan cleanup** - Remove backward compatibility when safe

## Questions or Issues?

- Backend changes: See commit for detailed diffs
- Frontend changes: See `FRONTEND_MIGRATION_GUIDE.md`
- Architecture questions: Review data flow diagrams above
- Implementation help: Check example patterns in guide
