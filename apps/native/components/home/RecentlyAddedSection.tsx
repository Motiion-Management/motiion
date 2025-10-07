import React from 'react';
import { useQuery } from 'convex/react';

import { api } from '@packages/backend/convex/_generated/api';
import { ResumeCard, type ResumeCardItem } from '~/components/ui/resume-card';
import { getProjectDisplayTitle, getProjectDisplaySubtitle } from '~/config/projectTypes';

interface RecentlyAddedSectionProps {
  onAddPress?: () => void;
  onItemPress?: (item: ResumeCardItem) => void;
}

export function RecentlyAddedSection({ onAddPress, onItemPress }: RecentlyAddedSectionProps) {
  const recentExperiences = useQuery(api.projects.getMyRecentProjects);

  const items: ResumeCardItem[] = React.useMemo(() => {
    if (!recentExperiences) return [];

    return recentExperiences.map((exp: any, index: number) => {
      const title = getProjectDisplayTitle(exp);
      const subtitle = getProjectDisplaySubtitle(exp);
      const displayTitle = subtitle ? `${title} - ${subtitle}` : title;

      return {
        id: exp._id,
        title: displayTitle,
        opacity: index === 0 ? 1 : index === 1 ? 0.8 : 0.6,
      };
    });
  }, [recentExperiences]);

  if (!recentExperiences) {
    return (
      <ResumeCard
        label="RESUME"
        title="Recently Added"
        items={[]}
        actionLabel="Add"
        onActionPress={onAddPress}
        onItemPress={onItemPress}
      />
    );
  }

  return (
    <ResumeCard
      label="RESUME"
      title="Recently Added"
      items={items}
      actionLabel="Add"
      onActionPress={onAddPress}
      onItemPress={onItemPress}
    />
  );
}
