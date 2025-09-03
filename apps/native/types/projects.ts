export type ProjectType = 'tv-film' | 'music-video' | 'live-performance' | 'commercial';

export type LivePerformanceEventType =
  | 'festival'
  | 'tour'
  | 'concert'
  | 'corporate'
  | 'award-show'
  | 'theater'
  | 'other';

// Base project interface
export interface BaseProject {
  id?: string;
  type: ProjectType;
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
export interface TvFilmProject extends BaseProject {
  type: 'tv-film';
  title: string;
  studio: string;
  startDate?: string;
  duration?: string;
}

// Music Video specific
export interface MusicVideoProject extends BaseProject {
  type: 'music-video';
  title: string;
  artists: string[];
  startDate?: string;
  duration?: string;
}

// Live Performance specific
export interface LivePerformanceProject extends BaseProject {
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
export interface CommercialProject extends BaseProject {
  type: 'commercial';
  companyName: string;
  title: string;
  productionCompany: string;
  startDate?: string;
  duration?: string;
}

// Union type for all projects
export type Project =
  | TvFilmProject
  | MusicVideoProject
  | LivePerformanceProject
  | CommercialProject;

// Form state for editing
export interface ProjectFormState {
  id: string;
  type: ProjectType;
  data: Partial<Project>;
  isComplete: boolean;
}

// Project config for UI
export interface ProjectTypeConfig {
  label: string;
  value: ProjectType;
  icon?: string;
  description?: string;
}

export interface ProjectFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'multiselect' | 'chips';
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  showForTypes?: ProjectType[];
  showForSubtypes?: LivePerformanceEventType[];
}
