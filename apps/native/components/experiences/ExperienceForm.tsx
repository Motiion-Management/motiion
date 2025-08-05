import React from 'react';

import { TvFilmForm } from './forms/TvFilmForm';
import { MusicVideoForm } from './forms/MusicVideoForm';
import { LivePerformanceForm } from './forms/LivePerformanceForm';
import { CommercialForm } from './forms/CommercialForm';
import { ExperienceType, Experience } from '~/types/experiences';

interface ExperienceFormProps {
  experienceType: ExperienceType;
  initialData?: Partial<Experience>;
  onChange: (data: Partial<Experience>) => void;
}

export function ExperienceForm({
  experienceType,
  initialData = {},
  onChange,
}: ExperienceFormProps) {
  console.log('===============');
  console.log('EXPERIENCE TYPE');
  console.log(experienceType);
  console.log('===============');
  // Route to the appropriate form based on experience type
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
