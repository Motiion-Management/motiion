# Onboarding V3 Migration Guide

## Overview

The V3 onboarding flow is a complete rewrite that simplifies the architecture:

- Flow is DEFINED in Convex backend but CONTROLLED by frontend
- Each step has pre-calculated navigation (no more complex calculations)
- Forms auto-submit and navigate automatically
- Decision points are handled elegantly with branching logic

## Activation Steps

### 1. Initialize V3 Flows in Convex

Run this mutation in the Convex dashboard:

```javascript
// In Convex dashboard, run:
await ctx.runMutation('onboardingFlowsV3:initializeV3Flows', {});
```

This creates V3 flows for all profile types (dancer, choreographer, guest).

### 2. Test with Feature Flag

Navigate to any onboarding screen with `?v3=true`:

```
/app/onboarding/hair-color?v3=true
```

Or set environment variable:

```
EXPO_PUBLIC_USE_V3_ONBOARDING=true
```

### 3. Monitor Performance

With V3 enabled, you should see:

- NO "navigation:calculateNextStep" logs
- NO "navigation:validation" delays
- NO "cursor:getCurrentStep" warnings
- NO backend sync operations
- Forms auto-submitting after selection

## Key Differences

### Old (V1) Flow

```
User selects option → Validate → Calculate next → Sync backend → Navigate
                      (delay)     (delay)         (delay)
```

### New (V3) Flow

```
User selects option → Auto-save → Navigate instantly
                      (800ms)     (pre-calculated)
```

## Architecture Changes

### Backend (Convex)

- `onboardingFlowsV3` table with enhanced schema
- Pre-calculated navigation in each step
- Decision routing built into flow definition

### Frontend

- `useOnboardingFlowV3` - Single hook for all flow state
- `AutoSubmitFormV3` - Forms that save and navigate automatically
- `GenericOnboardingScreenV3` - One component handles all screens

### Migration Path

1. Both systems run in parallel
2. Use feature flag to switch between them
3. Monitor performance and user experience
4. Gradually roll out to all users
5. Remove old system once stable

## Customization

### Custom Fields

If a screen needs custom behavior:

```typescript
<GenericOnboardingScreenV3
  customFields={{
    'specialField': CustomFieldComponent
  }}
/>
```

### Step Overrides

For completely custom screens:

```typescript
<GenericOnboardingScreenV3
  stepOverrides={{
    'headshots': CustomHeadshotsScreen
  }}
/>
```

## Troubleshooting

### Flow Not Loading

- Check V3 flows exist in Convex dashboard
- Verify `isActive: true` and `isDefault: true`
- Check console for flow fetch errors

### Auto-Submit Not Working

- Verify step has `autoSubmit: true`
- Check form validation is passing
- Look for save errors in console

### Navigation Not Working

- Ensure flow paths match route structure
- Check decision branches for typos
- Verify next/previous steps are defined correctly
