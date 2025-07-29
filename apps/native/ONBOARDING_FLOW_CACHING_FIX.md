# Onboarding Flow Caching Fix

## Problem

The performance logs showed `getUserFlow` was being called dozens of times per screen navigation, causing unnecessary load and delays:

- Each component using `useOnboardingFlow` made its own query
- Multiple components needed the flow data (OnboardingGuard, useOnboardingCursor, useClientSideValidation)
- Convex doesn't have built-in query caching - each `useQuery` creates a separate subscription

## Solution

Implemented a Context Provider pattern (similar to SharedUserProvider) to query once and share the data.

## Implementation

### 1. Created OnboardingFlowContext (`contexts/OnboardingFlowContext.tsx`)

- Makes the `getUserFlow` query once at the provider level
- Shares flow data to all child components via React Context
- Includes all helper functions from the original hook
- Provides backwards compatibility export

### 2. Added Provider to App Layout (`app/app/_layout.tsx`)

```tsx
<SharedUserProvider>
  <OnboardingFlowProvider>
    <Stack />
  </OnboardingFlowProvider>
</SharedUserProvider>
```

### 3. Updated All Consumers

- `useOnboardingCursor` → uses `useSharedOnboardingFlow`
- `OnboardingGuard` → uses `useSharedOnboardingFlow`
- `useClientSideValidation` → imports types from context

### 4. Removed Original Hook

- Deleted `hooks/useOnboardingFlow.ts` to avoid confusion
- Context exports `useOnboardingFlow` for backwards compatibility

## Results

- `getUserFlow` now runs only ONCE when app loads
- All components share the same flow data
- No more performance impact from repeated queries
- Cleaner logs without query spam

## Performance Impact

Before: 10-20+ getUserFlow queries per navigation
After: 1 getUserFlow query on app launch

This should eliminate the query overhead and make navigation feel much snappier!
