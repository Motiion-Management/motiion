import React from 'react';

import { TvFilmForm } from './forms/TvFilmForm';
import { MusicVideoForm } from './forms/MusicVideoForm';
import { LivePerformanceForm } from './forms/LivePerformanceForm';
import { CommercialForm } from './forms/CommercialForm';
import { DynamicExperienceForm } from './DynamicExperienceForm';
import { ExperienceType, Experience } from '~/types/experiences';

interface ExperienceFormProps {
  experienceType: ExperienceType;
  initialData?: Partial<Experience>;
  onChange: (data: Partial<Experience>) => void;
  useDynamicForm?: boolean; // Feature flag for testing
}

export function ExperienceForm({
  experienceType,
  initialData = {},
  onChange,
  useDynamicForm = true, // Default to false for now
}: ExperienceFormProps) {
  // Use dynamic form if flag is enabled
  if (useDynamicForm) {
    return (
      <DynamicExperienceForm
        experienceType={experienceType}
        initialData={initialData}
        onChange={onChange}
      />
    );
  }

  // Original implementation
  switch (experienceType) {
    case 'tv-film':
      return <TvFilmForm initialData={initialData} onChange={onChange} />;

    case 'music-video':
      return <MusicVideoForm initialData={initialData} onChange={onChange} />;

    case 'live-performance':
      return <LivePerformanceForm initialData={initialData} onChange={onChange} />;

    case 'commercial':
      return <CommercialForm initialData={initialData} onChange={onChange} />;

    default:
      throw new Error(`Unhandled experience type: ${experienceType}`);
  }
}
