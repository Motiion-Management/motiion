export type ExperienceType = 'tv-film' | 'music-video' | 'live-performance' | 'commercial';

export type LivePerformanceEventType =
  | 'festival'
  | 'tour'
  | 'concert'
  | 'corporate'
  | 'award-show'
  | 'theater'
  | 'other';

// Base experience interface
export interface BaseExperience {
  id?: string;
  type: ExperienceType;
  roles: string[];
  link?: string;
  media?: string;
  // Team fields
  mainTalent?: string[];
  choreographers?: string[];
  associateChoreographers?: string[];
  directors?: string[];
}

// TV/Film specific
export interface TvFilmExperience extends BaseExperience {
  type: 'tv-film';
  title: string;
  studio: string;
  startDate?: string;
  duration?: string;
}

// Music Video specific
export interface MusicVideoExperience extends BaseExperience {
  type: 'music-video';
  title: string;
  artists: string[];
  startDate?: string;
  duration?: string;
}

// Live Performance specific
export interface LivePerformanceExperience extends BaseExperience {
  type: 'live-performance';
  subtype: LivePerformanceEventType;
  title: string;
  startDate?: string;
  duration?: string;
  // Dynamic fields based on event type
  tourArtist?: string;
  companyName?: string;
  venue?: string;
}

// Commercial specific
export interface CommercialExperience extends BaseExperience {
  type: 'commercial';
  companyName: string;
  title: string;
  productionCompany: string;
  startDate?: string;
  duration?: string;
}

// Union type for all experiences
export type Experience =
  | TvFilmExperience
  | MusicVideoExperience
  | LivePerformanceExperience
  | CommercialExperience;

// Form state for editing
export interface ExperienceFormState {
  id: string;
  type: ExperienceType;
  data: Partial<Experience>;
  isComplete: boolean;
}

// Experience config for UI
export interface ExperienceTypeConfig {
  label: string;
  value: ExperienceType;
  icon?: string;
  description?: string;
}

export interface ExperienceFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'multiselect' | 'chips';
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  showForTypes?: ExperienceType[];
  showForSubtypes?: LivePerformanceEventType[];
}
