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

  return (
    <View className="gap-3">
      {experienceSlots.slice(0, maxExperiences).map((experience, index) => (
        <ExperienceCard
          key={index}
          experience={experience?.data}
          placeholder={getPlaceholder(index)}
          onPress={() => onExperiencePress(index)}
        />
      ))}
    </View>
  );
}
