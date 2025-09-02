import { ProjectTypeConfig } from '~/types/projects';

export const PROJECT_TYPE_OPTIONS: ProjectTypeConfig[] = [
  {
    label: 'Television & Film',
    value: 'tv-film',
    description: 'TV shows and movies',
  },
  {
    label: 'Music Videos',
    value: 'music-video',
    description: 'Music video productions',
  },
  {
    label: 'Live/Stage Performance',
    value: 'live-performance',
    description: 'Tours, festivals, concerts, and more',
  },
  {
    label: 'Print/Commercial',
    value: 'commercial',
    description: 'Commercial and print work',
  },
];

export const LIVE_EVENT_TYPES = [
  { label: 'Festival', value: 'festival' },
  { label: 'Tour', value: 'tour' },
  { label: 'Concert', value: 'concert' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Award Show', value: 'award-show' },
  { label: 'Theater Production', value: 'theater' },
  { label: 'Other', value: 'other' },
];

export const DURATION_OPTIONS = [
  { label: 'Current', value: 'Current' },
  { label: '1 day', value: '1 day' },
  { label: '3 days', value: '3 days' },
  { label: '1 week', value: '1 week' },
  { label: '2 weeks', value: '2 weeks' },
  { label: '1 month', value: '1 month' },
  { label: '2 months', value: '2 months' },
  { label: '3 months', value: '3 months' },
  { label: '6 months', value: '6 months' },
  { label: '1 year', value: '1 year' },
];

export const COMMON_ROLES = [
  'Principal Dancer',
  'Featured Dancer',
  'Ensemble Dancer',
  'Choreographer',
  'Assistant Choreographer',
  'Creative Director',
  'Movement Director',
  'Dance Captain',
  'Swing',
  'Understudy',
];

export const COMMON_STUDIOS = [
  'Netflix',
  'HBO',
  'Disney+',
  'Amazon Prime',
  'Apple TV+',
  'Paramount+',
  'Warner Bros',
  'Universal',
  'Sony Pictures',
  'MGM',
  'Lionsgate',
  'A24',
  'Focus Features',
];

// Helper function to get display title for a project
export const getProjectDisplayTitle = (project: any): string => {
  switch (project.type) {
    case 'tv-film':
      return project.title || 'Untitled Project';
    case 'music-video':
      return project.title || 'Untitled Song';
    case 'live-performance':
      switch (project.subtype) {
        case 'festival':
          return project.title || 'Festival';
        case 'tour':
          return project.title || 'Tour';
        case 'theater':
          return project.title || 'Theater Production';
        case 'award-show':
          return project.title || 'Award Show';
        case 'corporate':
        case 'other':
          return project.title || 'Event';
        case 'concert':
          return project.title || project.venue || 'Concert';
        default:
          return 'Performance';
      }
    case 'commercial':
      return project.title || 'Commercial';
    default:
      return 'Project';
  }
};

// Helper function to get display subtitle for a project
export const getProjectDisplaySubtitle = (project: any): string => {
  switch (project.type) {
    case 'tv-film':
      return project.studio || '';
    case 'music-video':
      return project.artists?.join(', ') || '';
    case 'live-performance':
      switch (project.subtype) {
        case 'tour':
          return project.tourArtist || '';
        case 'corporate':
          return project.companyName || '';
        case 'theater':
        case 'concert':
          return project.venue || '';
        default:
          return '';
      }
    case 'commercial':
      return project.companyName || '';
    default:
      return '';
  }
};

// Backward compatibility exports
export const EXPERIENCE_TYPES = PROJECT_TYPE_OPTIONS;
export const PROJECT_TYPES = [
  { label: 'Television', value: 'television' },
  { label: 'Film', value: 'film' },
];
export const getExperienceDisplayTitle = getProjectDisplayTitle;
export const getExperienceDisplaySubtitle = getProjectDisplaySubtitle;