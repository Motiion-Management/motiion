import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { useUser } from '~/hooks/useUser';
import type { DancerDoc } from '@packages/backend/convex/schemas/dancers';
import type { ChoreographerDoc } from '@packages/backend/convex/schemas/choreographers';

export interface OnboardingData {
  user: ReturnType<typeof useUser>['user'];
  profile: DancerDoc | ChoreographerDoc | null;
}

export function useOnboardingData() {
  const { user, isLoading: userLoading } = useUser();

  // Load active profile based on profileType
  const dancerProfile = useQuery(
    api.dancers.getMyDancerProfile,
    user?.activeProfileType === 'dancer' ? {} : 'skip'
  );

  const choreographerProfile = useQuery(
    api.choreographers.getMyChoreographerProfile,
    user?.activeProfileType === 'choreographer' ? {} : 'skip'
  );

  // Combine loading states
  const isLoading =
    userLoading ||
    (user?.activeProfileType === 'dancer' && dancerProfile === undefined) ||
    (user?.activeProfileType === 'choreographer' && choreographerProfile === undefined);

  // Combine data with profile
  const data: OnboardingData = useMemo(
    () => ({
      user,
      profile:
        (dancerProfile as DancerDoc | null) || (choreographerProfile as ChoreographerDoc | null),
    }),
    [user, dancerProfile, choreographerProfile]
  );

  return { data, isLoading };
}
