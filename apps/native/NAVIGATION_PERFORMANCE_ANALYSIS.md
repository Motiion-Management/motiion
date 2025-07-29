# Navigation Performance Analysis: Profile-Type to Headshots Screen

## Summary of Findings

After analyzing the codebase, I've identified several potential causes for the navigation delay between the profile-type and headshots screens.

## Key Performance Issues Identified

### 1. Multiple Concurrent Data Fetches

The headshots screen and its dependencies trigger multiple simultaneous data fetches:

- **OnboardingStepGuard** calls:
  - `useOnboardingStatus()` → `useQuery(api.users.getMyUser)`
  - `useOnboardingStatus()` → `useQuery(api.onboarding.getOnboardingStatus)`
  - `useOnboardingFlow()` → `useQuery(api.onboardingFlows.getUserFlow)`

- **HeadshotsScreen** itself calls:
  - `useQuery(api.users.headshots.getMyHeadshots)`

- **BaseOnboardingScreen** uses:
  - `useOnboardingCursor()` → `useQuery(api.users.getMyUser)` (duplicate!)
  - All the queries from `useOnboardingFlow()`

**Total: At least 5-6 separate queries fire on mount, with `getMyUser` being called multiple times**

### 2. Image URL Generation Blocking

In `getMyHeadshots`, there's a `Promise.all` that generates storage URLs for all existing headshots:

```typescript
return Promise.all(
  ctx.user.headshots.map(async (headshot) => ({
    url: await ctx.storage.getUrl(headshot.storageId),
    ...headshot,
  }))
);
```

This blocks until all image URLs are generated, which could be slow if there are multiple images.

### 3. Complex Flow Computation

The `getUserFlow` query in the backend performs:

- Database query for user
- Database query for onboarding flow
- Conditional filtering of steps based on user data
- Field value extraction with nested property support

This happens multiple times due to duplicate hook usage.

### 4. Navigation State Calculations

The `useOnboardingCursor` hook performs several expensive calculations on every render:

- Route parsing from segments
- Step index calculations
- Progress calculations
- Navigation state determinations

### 5. Prefetching Overhead

The `BaseOnboardingScreen` attempts to prefetch the next route on focus, which adds additional network requests during navigation.

## Recommendations for Optimization

### 1. Implement Data Caching/Deduplication

- Use a context provider to share `getMyUser` data across components
- Implement request deduplication for concurrent identical queries
- Cache onboarding flow data since it rarely changes

### 2. Optimize Image URL Generation

- Generate URLs lazily or in smaller batches
- Consider caching URLs with a TTL
- Load placeholder images first, then fetch URLs progressively

### 3. Reduce Query Overhead

- Combine related queries into a single endpoint
- Create a dedicated `getOnboardingScreenData` query that returns all needed data
- Use Convex's built-in caching more effectively

### 4. Memoize Heavy Computations

- Memoize route parsing and step calculations
- Cache navigation state calculations
- Use React.memo for components that don't need frequent updates

### 5. Optimize Component Mounting

- Lazy load the MultiImageUpload component
- Defer non-critical operations until after initial render
- Use React Suspense for data fetching boundaries

### 6. Profile-Type Screen Optimization

- Ensure the mutation completes before navigation
- Add loading state during profile type submission
- Consider optimistic navigation with rollback on error

## Quick Wins

1. **Remove duplicate `getMyUser` calls** - Create a shared hook or context
2. **Lazy load image URLs** - Don't block on URL generation
3. **Add loading states** - Show skeleton screens during data fetching
4. **Debounce navigation** - Prevent rapid navigation clicks
5. **Prefetch headshots data** - Start fetching when user selects profile type

## Next Steps

1. Implement performance monitoring to measure actual load times
2. Add React DevTools Profiler to identify render bottlenecks
3. Consider implementing React Query or SWR for better caching
4. Profile the Convex backend queries for optimization opportunities
