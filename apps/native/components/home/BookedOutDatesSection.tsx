import React from 'react';

import { ResumeCard, type ResumeCardItem } from '~/components/ui/resume-card';

interface BookedOutDatesSectionProps {
  onEditPress?: () => void;
  onItemPress?: (item: ResumeCardItem) => void;
}

const HARDCODED_DATES: ResumeCardItem[] = [
  {
    id: '1',
    title: 'A Nonsense Christmas - Sabrina Carpenter',
    opacity: 0.6,
  },
  {
    id: '2',
    title: "VMA's 2024 - Sabrina Carpenter",
    opacity: 0.8,
  },
  {
    id: '3',
    title: "Short N' Sweet Tour - Sabrina Carpenter",
    opacity: 1,
  },
];

export function BookedOutDatesSection({ onEditPress, onItemPress }: BookedOutDatesSectionProps) {
  return (
    <ResumeCard
      label="AVAILABILITY"
      title="Booked Out Dates"
      items={HARDCODED_DATES}
      actionLabel="Edit"
      onActionPress={onEditPress}
      onItemPress={onItemPress}
    />
  );
}
