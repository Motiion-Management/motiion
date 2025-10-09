Launch Optimization Roadmap

- Finalize current cleanup (✅ complete)
  - ✓ Remove <ClerkLoaded> gate.
  - ✓ Re-test reload to confirm no regressions.
- Phase 1: Kill redundant auth loading loops (✅ complete)
  - ✓ Refine useAuthenticated so RootIndex only blocks on Convex auth.
  - ✓ Keep /app/app/_layout.tsx mounted while auth/onboarding redirects run in effects.
  - ✓ Memoize SharedUserProvider values to eliminate grey flashes when the user query rehydrates.
  - ✓ Verification: reload + tab navigation confirmed stable.
- Phase 2: Onboarding routing polish (🚧 in progress)
  - ✓ Surface useOnboardingStatus inside /app/app/_layout.tsx to short-circuit routing when onboarding status is known.
  - ✓ Add safety net effect once Convex reports updated onboarding status.
  - ☐ Ensure onboarding screens remain functional via deep link without redirect loops.
    - Capture current redirect behavior in `app/app/onboarding/*` screens; note every `router.replace`/`router.push` and their guards.
    - Add a `useInitialOnboardingStatus` ref so deep links only auto-redirect on the first render after status change, not on focused onboarding routes.
    - Gate redirects when `router.canGoBack()` or when the incoming route already matches the onboarding stack to prevent loops.
    - Harden deep link paths in `linking.config.ts`: explicitly map onboarding routes and add test coverage via `npx expo start --scheme ... --dev-client` deep link commands.
  - ☐ Verification: log in as completed vs. incomplete user; confirm instant routing and no flicker; trigger deep link (completed + incomplete) to onboarding screen and ensure no redirect loops.
- Phase 3: Visual transition tightening (🗓 upcoming)
  - Consolidate splash/gradient styling so the same background persists from launch → tabs.
  - Only show the “loading gradient” component when no data is ready to render.
  - Verification: record a short screen capture—should show a single background before content appears.
- Phase 4: Adopt Convex + TanStack Query (high-impact, larger scope)
  - Add TanStack provider (QueryClient with sensible defaults) above ConvexProviderWithClerk.
  - Swap SharedUserProvider and other high-value useQuery calls to convexQuery(...), keeping gcTime modest (e.g., 10 min).
  - Layer in PersistQueryClientProvider + AsyncStorage to hydrate cached results on cold start.
  - Remove the ad-hoc SharedUserProvider once the new hook is stable.
  - Verification: clear app cache, relaunch—home screen should hydrate instantly with cached user data while Convex backfills updates.
- Phase 5: Post-migration cleanup / metrics (🗓 upcoming)
  - Audit remaining useQuery usage; convert or document deliberate holdouts.
  - Add lightweight logging or React Profiler capture to measure load times before/after.
  - Update internal docs (PERFORMANCE_OPTIMIZATION_GUIDE.md) with new patterns.
- Ongoing
  - After each phase, run pnpm lint && pnpm type-check for the native workspace.
  - Keep a manual test checklist (launch fresh, navigate tabs, trigger onboarding) to catch regressions early.

- Backlog
  - Revisit onboarding gate location post-Phase 2: prefer pushing users to onboarding from the auth flow instead of guarding every `/app` load.
  - Slot the TanStack Query migration (Phase 4) once the lighter onboarding gate is in place so caching work isn’t fighting redirect logic.

Following this sequence keeps the quick wins up front, then invests in the deeper caching improvements once the UI no longer blocks unnecessarily.
