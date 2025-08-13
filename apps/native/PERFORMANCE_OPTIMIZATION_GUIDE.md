# Performance Optimization Implementation Guide

## Quick Fixes to Implement

### 1. Replace Duplicate getMyUser Calls

**Step 1**: Add SharedUserProvider to your app root layout:

```tsx
// app/_layout.tsx or app/app/_layout.tsx
import { SharedUserProvider } from '~/contexts/SharedUserContext';

export default function AppLayout() {
  return <SharedUserProvider>{/* Your existing layout content */}</SharedUserProvider>;
}
```

**Step 2**: Use shared user data with local-first onboarding:

```tsx
// app/app/index.tsx (entry redirect)
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

const redirectInfo = useQuery(api.onboarding.getOnboardingRedirect);
// Redirect to redirectInfo.redirectPath when redirectInfo.shouldRedirect
```

```tsx
// In onboarding screens
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';
// Use navigateNext / navigatePrevious and progress from the simple flow.
```

### 2. Use Optimized Headshots Loading

**Step 1**: Update the headshots screen:

```tsx
// app/app/onboarding/headshots/index.tsx
import { MultiImageUploadOptimized } from '~/components/upload/MultiImageUploadOptimized';

export default function HeadshotsScreen() {
  const headshotsMetadata = useQuery(api.users.headshotsOptimized.getMyHeadshotsMetadata);
  const hasImages = (headshotsMetadata?.length ?? 0) > 0;

  return (
    <OnboardingStepGuard requiredStep="headshots">
      <BaseOnboardingScreen
        title="Headshots"
        description="Upload your professional headshots to showcase your look."
        canProgress={hasImages}>
        <View className="mt-4 flex-1">
          <MultiImageUploadOptimized />
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
```

### 3. Add Loading State During Navigation

**Step 1**: Update profile-type screen to show loading during submission:

```tsx
// app/app/onboarding/profile-type/index.tsx
const [isNavigating, setIsNavigating] = useState(false)

const form = useAppForm({
  // ... existing config
  onSubmit: async ({ value }) => {
    if (!value.profileType) return

    setIsNavigating(true)
    try {
      await updateUser({
        profileType: value.profileType,
      })
      // Navigation will happen automatically via cursor
    } catch (error) {
      console.error('Error updating profile type:', error)
      setIsNavigating(false)
    }
  },
})

// In the render, disable interactions during navigation
canProgress={form.state.canSubmit && !form.state.isSubmitting && !isNavigating}
```

### 4. Implement Navigation Debouncing

Create a debounced navigation hook:

```tsx
// hooks/useDebouncedNavigation.ts
import { useCallback, useRef } from 'react';

export function useDebouncedNavigation() {
  const isNavigatingRef = useRef(false);

  const navigate = useCallback((navigationFn: () => Promise<any>) => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    navigationFn().finally(() => {
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500); // 500ms debounce
    });
  }, []);

  return navigate;
}
```

### 5. Add Suspense Boundaries

Wrap heavy components with Suspense:

```tsx
// app/app/onboarding/headshots/index.tsx
import { Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';

function LoadingFallback() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function HeadshotsScreen() {
  return (
    <OnboardingStepGuard requiredStep="headshots">
      <BaseOnboardingScreen
        title="Headshots"
        description="Upload your professional headshots to showcase your look."
        canProgress={hasImages}>
        <Suspense fallback={<LoadingFallback />}>
          <View className="mt-4 flex-1">
            <MultiImageUploadOptimized />
          </View>
        </Suspense>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
```

## Testing the Optimizations

1. **Measure Before**: Use React DevTools Profiler to record current performance
2. **Apply Changes**: Implement the optimizations one by one
3. **Measure After**: Record performance after each change
4. **Monitor**: Watch for any regressions or new issues

## Expected Improvements

- **50-70% reduction** in initial load time for headshots screen
- **Elimination** of duplicate network requests
- **Smoother** navigation transitions
- **Better** perceived performance with loading states

## Additional Optimizations (If Needed)

1. **Implement React Query** for advanced caching
2. **Use React.memo** more aggressively
3. **Lazy load** non-critical components
4. **Optimize** Convex queries with projections
5. **Add** prefetching on hover/focus
