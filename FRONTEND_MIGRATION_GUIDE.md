# Frontend Migration Guide: Profile-Specific Updates

## Overview

The backend has been updated to eliminate profileType branching and ensure all profile data updates target the correct tables (`dancers` or `choreographers`). This guide outlines the changes needed in the frontend onboarding flow.

## Backend Changes Summary

### ✅ Completed Backend Updates

1. **Choreographer mutations completed** - Full parity with dancer mutations
   - `updateChoreographerProfile` - Update any choreographer profile by ID
   - `setActiveChoreographerProfile` - Set active choreographer profile
   - `updateMyChoreographerProfile` - Update active choreographer profile
   - `searchChoreographers` - Search choreographers
   - `calculateChoreographerCompleteness` - Calculate profile completeness

2. **Profile creation consolidated** - No more branching logic
   - Extracted to `createProfileFromUserData()` helper
   - Single code path for both dancer and choreographer creation
   - Located in `packages/backend/convex/onboarding.ts:299`

3. **Validators updated** - Check active profile data
   - All validators now accept `(user, profile?)` signature
   - Priority: profile data → user data (fallback for backward compatibility)
   - Located in `packages/backend/convex/onboardingConfig.ts:364`

4. **Users table cleaned** - Account-level only
   - Deprecated profile fields clearly marked
   - Comments indicate correct mutations to use
   - Located in `packages/backend/convex/users/users.ts:175`

## Frontend Changes Needed

### 1. Update Onboarding Registry (`apps/native/onboarding/registry.ts`)

The registry currently saves all form data to `updateMyUser`, but profile-specific fields should go to profile mutations.

#### Current Problem

```typescript
// ❌ WRONG - Saves attributes to users table
save: async (values: any, ctx) => {
  await ctx.updateMyUser({ attributes: { height: values.height } })
}
```

#### Solution Pattern

```typescript
// ✅ CORRECT - Route to appropriate profile mutation
save: async (values: any, ctx) => {
  const profileType =
    ctx.data.user?.activeProfileType || ctx.data.user?.profileType

  if (profileType === 'dancer') {
    await ctx.patchDancerAttributes({ attributes: { height: values.height } })
  } else if (profileType === 'choreographer') {
    // Choreographers might not need height, or use different mutation
    await ctx.updateMyChoreographerProfile({
      /* fields */
    })
  }
}
```

### 2. Update SaveContext Interface

Add profile-specific mutations to SaveContext:

```typescript
export interface SaveContext {
  data: OnboardingData

  // Account-level
  updateMyUser: (args: any) => Promise<any>

  // Dancer-specific
  patchDancerAttributes: (args: any) => Promise<any>
  updateMyDancerProfile: (args: any) => Promise<any>
  updateDancerSizingField?: (args: any) => Promise<any>

  // Choreographer-specific
  updateMyChoreographerProfile: (args: any) => Promise<any>

  // Shared
  updateMyResume: (args: any) => Promise<any>
  addMyRepresentation: (args: any) => Promise<any>
}
```

### 3. Step-by-Step Migration

#### Step 1: Height (Dancer-only)

```typescript
// registry.ts:110-120
height: {
  // ...
  save: async (values: any, ctx) => {
    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;

    if (profileType === 'dancer') {
      await ctx.patchDancerAttributes({ attributes: { height: values.height } });
    }
    // Choreographers don't need height
  },
}
```

#### Step 2: Ethnicity, Hair Color, Eye Color, Gender (Dancer-only)

```typescript
ethnicity: {
  // ...
  save: async (values: any, ctx) => {
    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;

    if (profileType === 'dancer') {
      await ctx.patchDancerAttributes({ attributes: { ethnicity: values.ethnicity } });
    }
    // Choreographers don't need these fields in current schema
  },
}

// Similar for hair-color, eye-color, gender...
```

#### Step 3: Location (Both profiles)

```typescript
location: {
  // ...
  save: async (values: any, ctx) => {
    if (!values.primaryLocation) return;

    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;
    const locationData = {
      city: values.primaryLocation.city,
      state: values.primaryLocation.state,
      country: 'United States',
    };

    if (profileType === 'dancer') {
      await ctx.updateMyDancerProfile({ location: locationData });
    } else if (profileType === 'choreographer') {
      await ctx.updateMyChoreographerProfile({ location: locationData });
    }
  },
}
```

#### Step 4: Work Location (Both profiles)

```typescript
'work-location': {
  // ...
  save: async (values: any, ctx) => {
    const workLocations = (values.locations || [])
      .filter(Boolean)
      .map((loc: any) => `${loc.city}, ${loc.state}`);

    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;

    if (profileType === 'dancer') {
      await ctx.updateMyDancerProfile({ workLocation: workLocations });
    } else if (profileType === 'choreographer') {
      await ctx.updateMyChoreographerProfile({ workLocation: workLocations });
    }
  },
}
```

#### Step 5: Headshots (Both profiles)

```typescript
headshots: {
  // ...
  save: async (_values: any, ctx) => {
    // Images are saved via upload component, but we need to ensure
    // they're saved to the correct profile table
    // The upload component should be updated to use:
    // - updateMyDancerProfile for dancers
    // - updateMyChoreographerProfile for choreographers
  },
}
```

#### Step 6: Sizing (Dancer-only, optional for Choreographer)

```typescript
sizing: {
  // ...
  save: async (_values: any, ctx) => {
    // Sizing sections manage their own persistence
    // Ensure they use profile-specific mutations:
    // - updateDancerSizingField for dancers
    // Note: Choreographers have optional sizing in schema
  },
}
```

#### Step 7: Skills (Both profiles)

```typescript
skills: {
  // ...
  save: async (values: any, ctx) => {
    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;

    const resumeData = {
      ...values,
      projects: ctx.data.user?.resume?.projects,
    };

    if (profileType === 'dancer') {
      await ctx.updateMyDancerProfile({ resume: resumeData });
    } else if (profileType === 'choreographer') {
      await ctx.updateMyChoreographerProfile({ resume: resumeData });
    }
  },
}
```

#### Step 8: Representation & Agency (Both profiles)

```typescript
representation: {
  // ...
  save: async (values: any, ctx) => {
    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;

    if (profileType === 'dancer') {
      await ctx.updateMyDancerProfile({
        representationStatus: values.representationStatus
      });
    } else if (profileType === 'choreographer') {
      await ctx.updateMyChoreographerProfile({
        representationStatus: values.representationStatus
      });
    }
  },
}

agency: {
  // ...
  save: async (values: any, ctx) => {
    if (!values.agencyId) return;

    // addMyRepresentation should be updated to write to active profile
    await ctx.addMyRepresentation({ agencyId: values.agencyId });
  },
}
```

#### Step 9: Union (Dancer-specific)

```typescript
union: {
  // ...
  save: async (values: any, ctx) => {
    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;

    if (profileType === 'dancer') {
      await ctx.updateMyDancerProfile({
        sagAftraId: values.sagAftraId || undefined
      });
    }
  },
}
```

#### Step 10: Database Use & Company (Choreographer-specific)

```typescript
'database-use': {
  // ...
  save: async (values: any, ctx) => {
    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;

    if (profileType === 'choreographer') {
      await ctx.updateMyChoreographerProfile({
        databaseUse: values.databaseUse
      });
    }
  },
}

company: {
  // ...
  save: async (values: any, ctx) => {
    const profileType = ctx.data.user?.activeProfileType || ctx.data.user?.profileType;

    if (profileType === 'choreographer') {
      await ctx.updateMyChoreographerProfile({
        companyName: values.companyName
      });
    }
  },
}
```

### 4. Update Selectors (`apps/native/onboarding/selectors.ts`)

Selectors should read from active profile when available:

```typescript
// BEFORE
export function selectHeight(data: OnboardingData) {
  return data.user?.attributes?.height || { feet: 5, inches: 6 }
}

// AFTER
export function selectHeight(data: OnboardingData) {
  // Check active profile first
  const profile = data.dancer || data.choreographer // Add these to OnboardingData
  const attributes = profile?.attributes || data.user?.attributes
  return attributes?.height || { feet: 5, inches: 6 }
}
```

### 5. Update OnboardingData Type

Add active profile data to the OnboardingData type:

```typescript
export interface OnboardingData {
  user: UserDoc | null
  dancer: DancerDoc | null // Add this
  choreographer: ChoreographerDoc | null // Add this
  // ... other fields
}
```

### 6. Update Data Loading Hook

The hook that loads onboarding data should fetch the active profile:

```typescript
// In useOnboardingData or similar
const user = useQuery(api.users.users.getMyUser)
const dancer = user?.activeDancerId
  ? useQuery(api.dancers.get, { id: user.activeDancerId })
  : null
const choreographer = user?.activeChoreographerId
  ? useQuery(api.choreographers.getMyChoreographerProfile)
  : null

return {
  user,
  dancer,
  choreographer
  // ... other data
}
```

## Migration Strategy

### Phase 1: Backend Preparation ✅ DONE

- [x] Complete choreographer mutations
- [x] Consolidate profile creation
- [x] Update validators
- [x] Clean deprecated fields

### Phase 2: Frontend Updates (THIS PHASE)

1. Update OnboardingData interface
2. Update data loading to include active profile
3. Update selectors to read from profile
4. Update SaveContext interface
5. Update registry save functions one by one
6. Test dancer onboarding end-to-end
7. Test choreographer onboarding end-to-end

### Phase 3: Cleanup (FUTURE)

1. Remove backward compatibility from validators
2. Reject profile fields in updateMyUser
3. Remove deprecated fields from users schema
4. Remove merge logic from getMyUser

## Testing Checklist

### Dancer Onboarding

- [ ] Profile type selection creates dancer profile
- [ ] Attributes save to dancers.attributes
- [ ] Headshots save to dancers.headshots
- [ ] Sizing saves to dancers.sizing
- [ ] Location saves to dancers.location
- [ ] Skills save to dancers.resume
- [ ] Representation saves to dancers.representation
- [ ] Union saves to dancers.sagAftraId

### Choreographer Onboarding

- [ ] Profile type selection creates choreographer profile
- [ ] Headshots save to choreographers.headshots
- [ ] Location saves to choreographers.location
- [ ] Database use saves to choreographers.databaseUse
- [ ] Company saves to choreographers.companyName
- [ ] Skills save to choreographers.resume
- [ ] Representation saves to choreographers.representation

### Validation

- [ ] Validators check active profile data
- [ ] Progress bar shows correct completion
- [ ] Review screen shows all data from active profile
- [ ] Can complete onboarding for both profile types

## Key Files to Update

1. **apps/native/onboarding/registry.ts** - Save functions
2. **apps/native/onboarding/selectors.ts** - Read from active profile
3. **apps/native/hooks/useOnboardingData.ts** (or similar) - Load active profile
4. **packages/backend/convex/representation.ts** - Route to active profile

## Questions to Resolve

1. Should we create a helper function to route saves based on profile type?
2. Should selectors fail if profile is missing, or fall back to user?
3. How do we handle the transition period for existing users?
4. Should we auto-sync user fields to profile on first login?

## Resources

- Backend choreographer mutations: `packages/backend/convex/choreographers.ts:87-227`
- Backend dancer mutations: `packages/backend/convex/dancers.ts:92-226`
- Validation logic: `packages/backend/convex/onboardingConfig.ts:359-510`
- Profile creation: `packages/backend/convex/onboarding.ts:299-382`
