import { ExperienceTypeConfig } from '~/types/experiences';

export const EXPERIENCE_TYPES: ExperienceTypeConfig[] = [
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

export const PROJECT_TYPES = [
  { label: 'Television', value: 'television' },
  { label: 'Film', value: 'film' },
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

// Field configuration arrays have been removed in favor of Convex Zod-driven dynamic forms.

// Helper function to get display title for an experience
export const getExperienceDisplayTitle = (experience: any): string => {
  switch (experience.type) {
    case 'tv-film':
      return experience.title || 'Untitled Project';
    case 'music-video':
      return experience.title || 'Untitled Song';
    case 'live-performance':
      switch (experience.subtype) {
        case 'festival':
          return experience.title || 'Festival';
        case 'tour':
          return experience.title || 'Tour';
        case 'theater':
          return experience.title || 'Theater Production';
        case 'award-show':
          return experience.title || 'Award Show';
        case 'corporate':
        case 'other':
          return experience.title || 'Event';
        case 'concert':
          return experience.title || experience.venue || 'Concert';
        default:
          return 'Performance';
      }
    case 'commercial':
      return experience.title || 'Commercial';
    default:
      return 'Project';
  }
};

// Helper function to get display subtitle for an experience
export const getExperienceDisplaySubtitle = (experience: any): string => {
  switch (experience.type) {
    case 'tv-film':
      return experience.studio || '';
    case 'music-video':
      return experience.artists?.join(', ') || '';
    case 'live-performance':
      switch (experience.subtype) {
        case 'tour':
          return experience.tourArtist || '';
        case 'corporate':
          return experience.companyName || '';
        case 'theater':
        case 'concert':
          return experience.venue || '';
        default:
          return '';
      }
    case 'commercial':
      return experience.companyName || '';
    default:
      return '';
  }
};
