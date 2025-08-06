import React from 'react';
import { View } from 'react-native';

import { ExperienceCard } from './ExperienceCard';
import { ExperienceFormState } from '~/types/experiences';

interface ExperienceSectionProps {
  experiences: (ExperienceFormState | null)[];
  onExperiencePress: (index: number) => void;
  maxExperiences?: number;
}

export function ExperienceSection({
  experiences,
  onExperiencePress,
  maxExperiences = 3,
}: ExperienceSectionProps) {
  // Ensure we have exactly maxExperiences slots
  const experienceSlots = [...experiences];
  while (experienceSlots.length < maxExperiences) {
    experienceSlots.push(null);
  }

  const getPlaceholder = (index: number): string => {
    return `Project ${index + 1}`;
  };

  const getCardVariant = (index: number): 'completed' | 'default' | 'disabled' => {
    const experience = experienceSlots[index];

    // If this slot has an experience, it's completed
    if (experience?.data) {
      return 'completed';
    }

    // Find the index of the first empty slot
    const firstEmptyIndex = experienceSlots.findIndex((exp) => !exp?.data);

    // If this is the first empty slot, it's default (active)
    if (index === firstEmptyIndex) {
      return 'default';
    }

    // All other empty slots are disabled
    return 'disabled';
  };

  const isCardDisabled = (index: number): boolean => {
    return getCardVariant(index) === 'disabled';
  };

  return (
    <View className="gap-3">
      {experienceSlots.slice(0, maxExperiences).map((experience, index) => (
        <ExperienceCard
          key={index}
          experience={experience?.data}
          placeholder={getPlaceholder(index)}
          variant={getCardVariant(index)}
          disabled={isCardDisabled(index)}
          onPress={() => onExperiencePress(index)}
        />
      ))}
    </View>
  );
}
