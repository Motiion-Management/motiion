# Multi-Profile Architecture Migration Plan

## Current Status: SIMPLIFIED APPROACH - Ready to Deploy ✅

### 🚀 Quick Start - Simplified Migration

Due to minimal data (1 dev user, 0 choreographers), we simplified the migration:

```bash
# 1. Deploy the code to dev
pnpm dev

# 2. Run the one-time migration
npx convex run migrations/autoMigrateAndCleanup:runMigration

# 3. Test with your dev user
# 4. Deploy to prod and run once

# That's it! The system auto-heals stragglers via getMyUser
```

### How It Works:
1. **Auto-healing `getMyUser`**: Automatically merges profile data for backward compatibility
2. **One-time migration script**: Migrates all existing users to profile tables
3. **Dual-write protection**: Updates write to both locations during transition
4. **Clean cutoff**: After migration, new users get profiles automatically via onboarding

---

### Completed Work (Phase 0, 1 & Simplified 2):

#### Phase 0: Schema Organization ✅
- Renamed `validators/` folder to `schemas/` across entire codebase
- Updated 47 files with new import paths
- Fixed all TypeScript compilation issues

#### Phase 1: Schema Foundation ✅
- Created `schemas/dancers.ts` with complete dancer profile schema
- Created `schemas/choreographers.ts` with choreographer-specific fields
- Updated `schema.ts` with new tables and indexes:
  - `dancers` table with userId, active, and search indexes
  - `choreographers` table with userId, active, verified, and search indexes
- Created CRUD functions:
  - `dancers.ts` - Full CRUD + search + completeness calculation
  - `choreographers.ts` - Full CRUD + search + completeness + verification
- Created `profiles/common.ts` with minimal shared utilities:
  - `getMyActiveProfile` - Get active profile for any type
  - `getUserProfiles` - Get all profiles for a user
  - `switchProfile` - Switch between profile types

#### Phase 2: Migration Infrastructure ✅
- Created `migrations/createDancerProfiles.ts` with:
  - `getDancersToMigrate` - Query to find users needing migration
  - `migrateDancerUser` - Mutation to migrate individual users
  - `migrateDancersBatch` - Batch migration with dry-run support
- Created `migrations/createChoreographerProfiles.ts` with similar structure
- Updated `schemas/users.ts` with profile reference fields:
  - `activeProfileType` - Current profile type ('dancer' or 'choreographer')
  - `activeDancerId` - Reference to active dancer profile
  - `activeChoreographerId` - Reference to active choreographer profile
- Implemented dual-write in `users.ts`:
  - `updateMyUser` - Writes to both user and active profile
  - `updateMySizingField` - Updates sizing in both locations
  - `patchUserAttributes` - Updates attributes in both locations
- Updated `onboarding.ts`:
  - `completeOnboarding` - Creates profile in new table on completion
- Created `migrations/runMigrations.ts`:
  - `runAllMigrations` - Orchestrates all migrations
  - `verifyMigrationStatus` - Checks migration completion
  - `testMigration` - Runs test migration with small batch

### Key Design Decisions Made:
1. **Separate tables** for dancers and choreographers (not single profiles table)
   - Better performance at scale (10,000s dancers vs 100s choreographers)
   - Clean schema evolution for type-specific features
   - Optimal indexing strategies for each type

2. **Minimal common utilities** - profiles/common.ts only handles:
   - Getting active profile
   - Switching profiles
   - Getting all profiles for a user
   - Profile-specific logic stays in respective files

3. **Profile ownership model**:
   - Users can have multiple profiles (both dancer and choreographer)
   - Only one profile active at a time
   - `isPrimary` marks first profile created during onboarding

---

## Remaining Work:

### ✅ SIMPLIFIED Migration Approach (COMPLETE)

**Pivoted to simpler approach due to small data size:**
- Only 1 dev user, disposable prod users, 0 choreographers
- Removed complex migration infrastructure
- Implemented auto-migration approach instead

**What was implemented:**
- ✅ Modified `getMyUser` to auto-merge profile data for backward compatibility
- ✅ Created simple `autoMigrateAndCleanup.ts` for one-time migration
- ✅ Kept dual-write implementation for data consistency
- ✅ Onboarding flow creates profiles in new tables

**To run the migration:**
```bash
# Run the one-time migration (dev environment)
npx convex run migrations/autoMigrateAndCleanup:runMigration

# Deploy to prod and run once there too
```

### Phase 3: Update Core Functions (Week 2)

#### 3.1 Update User Query Functions
**File: `users.ts`**
- `getMyUser` modification:
  ```typescript
  // Fetch user data
  // If activeProfileType exists, fetch and merge active profile
  // Return combined data for backward compatibility
  ```

#### 3.2 Update Onboarding Flow
**File: `onboarding.ts`**
- When user selects profileType:
  - Create profile in appropriate table (dancers/choreographers)
  - Set user's activeProfileType, activeDancerId/activeChoreographerId
  - Mark profile as isPrimary = true

#### 3.3 Update Profile-Specific Functions
These need to check both old (users table) and new (profile tables) locations:
- `users/headshots.ts` - Check for profile first, fall back to user
- `users/resume.ts` - Similar dual-location checking
- `users/representation.ts` - Dual location support
- `users/projects.ts` - Add profileId field (keep userId for now)
- `training.ts` - Add profileId field (keep userId for now)

### Phase 4: Frontend Integration (Week 2-3)

#### 4.1 Create Profile Context
**File: `apps/native/contexts/ProfileContext.tsx`**
```typescript
// Context to manage active profile
// Provides:
//   - activeProfile (dancer | choreographer data)
//   - profileType
//   - switchProfile function
//   - loading states
```

#### 4.2 Update Existing Queries
- Audit all `api.users.*` calls
- Update to use profile-aware queries where needed
- Add profile type to navigation state

#### 4.3 Profile Switching UI
- Add profile selector in settings
- Show "Add Another Profile" after first profile complete
- Update navigation to show profile-specific options

### Phase 5: Cleanup & Optimization (Week 3-4)

#### 5.1 Data Verification
- Run verification queries to ensure all data migrated correctly
- Compare old vs new data for consistency
- Fix any missing/incorrect migrations

#### 5.2 Remove Old Fields (ONLY AFTER VERIFICATION)
**File: `schemas/users.ts`**
- Remove all profile-specific fields:
  - headshots, attributes, sizing, resume, links
  - sagAftraId, companyName, workLocation
  - training, representationStatus
  - Keep only account-level data

#### 5.3 Remove Dual Write Code
- Remove backward compatibility from all functions
- Update all queries to only use new profile tables
- Clean up migration functions

#### 5.4 Performance Optimization
- Add missing indexes based on query patterns
- Optimize search patterns
- Add caching for frequently accessed profiles

### Phase 6: Future Features Foundation

#### 6.1 Enhanced Profile Features
**Dancers:**
- Availability calendar
- Dance style specializations
- Performance videos section
- Audition history

**Choreographers:**
- Workshop scheduling
- Rate cards
- Verified badge system
- Portfolio/notable works gallery

#### 6.2 Multi-Profile Features
- Quick profile switcher
- Profile comparison view
- Cross-profile data sharing (e.g., headshots)
- Profile templates for quick creation

---

## Migration Rollback Plan

### Checkpoints:
1. **After Phase 2.1**: Verify migration creates valid profiles
2. **After Phase 2.3**: Verify dual writes work correctly
3. **After Phase 3**: Verify all functions work with new structure
4. **Before Phase 5.2**: Final verification before removing old fields

### Rollback Strategy:
- Phase 1-3: Can rollback by simply not using new tables
- Phase 4: Feature flag to switch between old/new UI
- Phase 5: Keep backup of old schema for emergency restore

---

## Testing Checklist

### Unit Tests Needed:
- [ ] Profile creation for new users
- [ ] Profile migration for existing users
- [ ] Profile switching logic
- [ ] Completeness calculation
- [ ] Search pattern generation

### Integration Tests:
- [ ] Onboarding flow with profile creation
- [ ] Profile updates propagate correctly
- [ ] Projects/training link to correct profile
- [ ] Search works across profile types

### Manual Testing:
- [ ] Create dancer profile
- [ ] Create choreographer profile
- [ ] Switch between profiles
- [ ] Update profile data
- [ ] Search for profiles

---

## Success Metrics

### Technical:
- Zero data loss during migration
- Query performance improved by 30%+ for choreographer queries
- No increase in user-facing latency
- All TypeScript types properly defined

### Product:
- Users can have multiple profiles
- Profile switching works seamlessly
- Profile-specific features enabled
- Search/discovery improved

---

## Next Immediate Actions (When Resuming):

1. **Create migration functions** (Phase 2.1)
   - Start with `migrations/createDancerProfiles.ts`
   - Test on small subset first

2. **Update users schema** (Phase 2.2)
   - Add profile reference fields
   - Keep old fields for dual write

3. **Implement dual write** (Phase 2.3)
   - Update `updateMyUser` first
   - Test thoroughly before proceeding

4. **Create feature flag** for gradual rollout
   - Allow testing with specific users
   - Easy rollback if issues

---

## Important Notes:

### DO NOT:
- Remove old fields until Phase 5
- Skip the dual write period
- Migrate all users at once
- Update frontend before backend is stable

### DO:
- Test each phase thoroughly
- Keep old fields during migration
- Use feature flags for safety
- Monitor performance metrics
- Document any issues found

### Current File Structure:
```
convex/
├── schemas/
│   ├── dancers.ts ✅
│   ├── choreographers.ts ✅
│   └── users.ts (needs update in Phase 2)
├── dancers.ts ✅
├── choreographers.ts ✅
├── profiles/
│   └── common.ts ✅
├── migrations/ (to be created)
│   ├── createDancerProfiles.ts
│   └── createChoreographerProfiles.ts
└── users.ts (needs update in Phase 3)
```

This plan provides a complete roadmap for implementing the multi-profile architecture while maintaining system stability and data integrity throughout the migration.