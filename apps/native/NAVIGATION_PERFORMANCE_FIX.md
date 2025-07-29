# Navigation Performance Fix Summary

## Problem

- Long delay when navigating between onboarding screens (profile-type → headshots)
- Multiple duplicate `getMyUser` queries (3-4 per navigation)
- Blocking image URL generation in headshots screen

## Solution Implemented

### 1. SharedUserProvider

Created a context provider to share user data across all components:

- Eliminates duplicate `getMyUser` queries
- Single source of truth for user data
- Applied at app layout level

### 2. Optimized Queries

- Created `getMyHeadshotsMetadata` - returns metadata immediately without blocking on URLs
- Created `getHeadshotUrl` - loads individual URLs on demand
- Progressive image loading pattern

### 3. Hook Updates

Updated these hooks to use SharedUserProvider:

- `useOnboardingCursor`
- `useOnboardingStatus`

## Result

- Reduced network requests from 4 to 1 per navigation
- Non-blocking navigation to headshots screen
- Progressive image loading for better perceived performance

## Next Steps (Optional)

1. Apply progressive loading pattern to other image-heavy screens
2. Implement prefetching for next screen data
3. Add Suspense boundaries for better loading states
