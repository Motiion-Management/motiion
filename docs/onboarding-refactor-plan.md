# Onboarding Navigation Refactor Plan (Deprecated)

Note: This document described a server-driven onboarding flow stored in Convex. The project has moved to a local-first model where the client controls the flow and the server only persists the last step and completion status for redirect. The `onboardingFlows` table and associated APIs were removed.

## Core Architecture Decisions

### Current Approach Summary

- Flow defined client-side via `useSimpleOnboardingFlow`.
- Server exposes minimal APIs: `setOnboardingStep`, `getOnboardingRedirect`, `completeOnboarding`, `resetOnboarding`.
- Screens validate and save their own data; onboarding completion is non-blocking.

### 2. Local-First Navigation

- URL remains the source of truth for current position
- Client handles all navigation decisions based on cached flow
- Server only validates data completion, not navigation flow
- Optimistic navigation with async validation

### 3. Real-Time Form Persistence

- Every form field auto-saves to Convex on change
- Debounced text inputs (300ms), immediate for selections
- Navigation enabled/disabled based on Convex query state
- Leverage Convex's real-time sync instead of manual refetching

## Implementation Phases

### Migration Notes (historical)

1. **Create Convex table schema**:

   ```typescript
   onboardingFlows: defineTable({
     version: v.string(),
     profileType: v.string(),
     steps: v.array(
       v.object({
         id: v.string(),
         name: v.string(),
         route: v.string(),
         required: v.array(v.string()),
         conditional: v.optional(
           v.object({
             field: v.string(),
             value: v.string(),
             show: v.boolean()
           })
         ),
         validation: v.optional(
           v.object({
             type: v.string(), // "backend" or "local"
             endpoint: v.optional(v.string())
           })
         )
       })
     ),
     decisionPoints: v.array(
       v.object({
         stepId: v.string(),
         field: v.string(),
         branches: v.array(
           v.object({
             value: v.string(),
             nextStep: v.string()
           })
         )
       })
     ),
     isActive: v.boolean(),
     createdAt: v.string()
   })
   ```

2. **Fix navigation error**:
   - Remove `beforeRemove` listener from BaseOnboardingScreen
   - Replace `router.dismissTo()` with `router.replace()`
   - Implement proper back handling with navigation state

This section is retained for historical context but is not applicable after the pivot to client-controlled onboarding.

1. **Migrate existing flow constants to Convex table**:
   - Convert ONBOARDING_FLOWS to table entries
   - Add conditional logic for agency step
   - Include decision matrices for dynamic routing

2. **Create flow query hook**:
   ```typescript
   const useOnboardingFlow = () => {
     const user = useQuery(api.users.getMyUser)
     const flow = useQuery(api.onboarding.getFlow, {
       version: CURRENT_VERSION,
       profileType: user?.profileType
     })
     // Cache and return processed flow
   }
   ```

See `apps/native/hooks/useSimpleOnboardingFlow.ts` for the current navigation implementation.

1. **Refactor useOnboardingCursor**:
   - Remove backend step validation calls
   - Use cached flow for all navigation decisions
   - Implement optimistic navigation

2. **Centralize conditional logic**:
   - Single function to evaluate step visibility
   - Use decision matrices from flow data
   - Remove duplicate agency filtering

Forms own validation and persistence per screen (unchanged).

1. **Create auto-save form hooks**:

   ```typescript
   const useOnboardingForm = (stepId: string) => {
     const updateField = useMutation(api.onboarding.updateField)
     // Auto-save logic with debouncing
     // Real-time validation state from Convex
   }
   ```

2. **Update all form components**:
   - Remove manual save buttons where appropriate
   - Show real-time save status
   - Enable navigation based on Convex state

General performance tips still apply.

1. **Implement prefetching**:
   - Preload all onboarding screens on mount
   - Cache user data for instant population

2. **Add optimistic updates**:
   - Navigate immediately, validate async
   - Show loading states instead of blocking

3. **Error recovery**:
   - Handle offline scenarios
   - Retry failed mutations
   - Conflict resolution for concurrent edits

## Success Metrics

- Navigation errors eliminated
- Form interactions feel instant (<100ms feedback)
- Reduced server calls by 80%
- Onboarding completion rate increase
- Easy to add/modify onboarding flows

## Technical Debt Addressed

1. Navigation state synchronization issues
2. Duplicate conditional logic
3. Slow form responsiveness
4. Difficult flow modifications
5. Missing error handling

## Future Enhancements

- A/B testing different flows
- Personalized onboarding paths
- Skip/resume functionality
- Progress persistence across devices
