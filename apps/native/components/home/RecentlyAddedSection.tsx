import React from 'react';
import { useQuery } from 'convex/react';

import { api } from '@packages/backend/convex/_generated/api';
import { ResumeCard, type ResumeCardItem } from '~/components/ui/resume-card';
import { getExperienceDisplayTitle, getExperienceDisplaySubtitle } from '~/config/experienceTypes';

interface RecentlyAddedSectionProps {
  onAddPress?: () => void;
  onItemPress?: (item: ResumeCardItem) => void;
}

export function RecentlyAddedSection({ onAddPress, onItemPress }: RecentlyAddedSectionProps) {
  const recentExperiences = useQuery(api.users.experiences.getMyRecentExperiences);

  const items: ResumeCardItem[] = React.useMemo(() => {
    if (!recentExperiences) return [];

    return recentExperiences.map((exp, index) => {
      const title = getExperienceDisplayTitle(exp);
      const subtitle = getExperienceDisplaySubtitle(exp);
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
