import { useQuery } from 'convex/react';
import { NameAndLocationOverlay } from '~/components/dancer-profile/NameAndLocationOverlay';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { useLocalSearchParams, router, Redirect } from 'expo-router';

export default function DancerDetails() {
  const { id } = useLocalSearchParams<{ id: Id<'dancers'> }>();
  const profileData = useQuery(
    api.dancers.getDancerProfileWithDetails,
    id ? { dancerId: id } : 'skip'
  );

  if (!profileData) return <Redirect href="/app/home" />;

  const { dancer, headshotUrls, recentProjects, allProjects, training, isOwnProfile } = profileData;

  return <NameAndLocationOverlay dancer={dancer} />;
}
