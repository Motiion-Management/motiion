# Navigation Performance Debugging Implementation

## What Was Added

Comprehensive performance tracking throughout the navigation flow to identify the source of the 2+ second delays.

## Performance Tracking Points

### 1. Performance Debug Utilities (`utils/performanceDebug.ts`)

- `perfMark()` - Start a performance measurement
- `perfMeasure()` - End measurement and log duration
- `perfLog()` - Log events with timestamps
- `trackNavigation` - Navigation-specific helpers
- `trackScreen` - Screen mount/unmount tracking
- `trackQuery` - Data fetching performance

### 2. Navigation Flow (`useOnboardingCursor.ts`)

Tracks timing for:

- Route calculation
- Client-side validation
- Next/previous step determination
- Router.push() calls
- Background sync queueing

### 3. Screen Components

- **BaseOnboardingScreen**: Mount/unmount timing, prefetch operations
- **ProfileTypeScreen**: Screen-specific mount tracking
- **HeadshotsScreen**: Query timing for headshots data
- **OnboardingStepGuard**: Guard evaluation timing

### 4. Data Loading (`useOnboardingFlow.ts`)

- Flow data query start/completion
- Step count and decision points

## How to Use

1. **Run the app with console open**
2. **Navigate between screens**
3. **Look for patterns in the logs**:

```
[PERF] 14:32:45.123 START: navigation:start {from: "profile-type", to: "next"}
[PERF] 14:32:45.125 START: navigation:validation
[PERF] 14:32:45.127 END: navigation:validation (2.00ms) {isValid: true}
[PERF] 14:32:45.128 START: navigation:routerPush
[PERF] 14:32:47.456 END: navigation:routerPush (2328.00ms)  // <-- This is the delay!
```

## What to Look For

1. **Long `routerPush` durations** - Indicates React Navigation/Expo Router delays
2. **Long query times** - Database/network delays
3. **Multiple `getMyUser` calls** - Redundant data fetching
4. **Guard evaluation delays** - Authentication/permission checking
5. **Screen mount delays** - Heavy component initialization

## Common Performance Issues

1. **Expo Router Navigation** - The actual navigation transition
2. **Component Mounting** - Heavy components blocking the main thread
3. **Synchronous Operations** - Blocking code during render
4. **Multiple Re-renders** - Unnecessary component updates

## Next Steps

Once you identify the bottleneck from the logs:

1. If it's router.push taking 2+ seconds, the issue is with Expo Router/React Navigation
2. If it's component mounting, look for heavy operations in useEffect
3. If it's queries, optimize the backend queries
4. If it's re-renders, add memoization

The logs will show exactly where the time is being spent!
