import {
  ExperienceTypeConfig,
  ExperienceFieldConfig,
  LivePerformanceEventType,
} from '~/types/experiences';

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

// Field configurations for different experience types
export const EXPERIENCE_FIELDS: ExperienceFieldConfig[] = [
  // TV/Film fields
  {
    name: 'projectType',
    label: 'Project Type',
    type: 'select',
    options: PROJECT_TYPES,
    required: true,
    showForTypes: ['tv-film'],
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Enter project title',
    required: true,
    showForTypes: ['tv-film'],
  },
  {
    name: 'studio',
    label: 'Studio',
    type: 'select',
    options: COMMON_STUDIOS.map((s) => ({ label: s, value: s })),
    required: true,
    showForTypes: ['tv-film'],
  },

  // Music Video fields
  {
    name: 'songTitle',
    label: 'Song Title',
    type: 'text',
    placeholder: 'Enter song title',
    required: true,
    showForTypes: ['music-video'],
  },
  {
    name: 'artists',
    label: 'Song Artist(s)',
    type: 'chips',
    placeholder: 'Add artist names',
    required: true,
    showForTypes: ['music-video'],
  },

  // Live Performance fields
  {
    name: 'subtype',
    label: 'Event Type',
    type: 'select',
    options: LIVE_EVENT_TYPES,
    required: true,
    showForTypes: ['live-performance'],
  },
  {
    name: 'festivalTitle',
    label: 'Festival Title',
    type: 'text',
    placeholder: 'Enter festival name',
    required: true,
    showForTypes: ['live-performance'],
    showForSubtypes: ['festival'],
  },
  {
    name: 'tourName',
    label: 'Tour Name',
    type: 'text',
    placeholder: 'Enter tour name',
    required: true,
    showForTypes: ['live-performance'],
    showForSubtypes: ['tour'],
  },
  {
    name: 'tourArtist',
    label: 'Tour Artist',
    type: 'text',
    placeholder: 'Enter artist name',
    required: true,
    showForTypes: ['live-performance'],
    showForSubtypes: ['tour'],
  },
  {
    name: 'companyName',
    label: 'Company Name',
    type: 'text',
    placeholder: 'Enter company name',
    required: true,
    showForTypes: ['live-performance', 'commercial'],
    showForSubtypes: ['corporate'],
  },
  {
    name: 'eventName',
    label: 'Event Name',
    type: 'text',
    placeholder: 'Enter event name',
    required: true,
    showForTypes: ['live-performance'],
    showForSubtypes: ['corporate', 'other'],
  },
  {
    name: 'awardShowName',
    label: 'Award Show Name',
    type: 'text',
    placeholder: 'Enter award show name',
    required: true,
    showForTypes: ['live-performance'],
    showForSubtypes: ['award-show'],
  },
  {
    name: 'productionTitle',
    label: 'Production Title',
    type: 'text',
    placeholder: 'Enter production title',
    required: true,
    showForTypes: ['live-performance'],
    showForSubtypes: ['theater'],
  },
  {
    name: 'venue',
    label: 'Venue',
    type: 'text',
    placeholder: 'Enter venue name',
    showForTypes: ['live-performance'],
    showForSubtypes: ['concert', 'theater'],
  },

  // Commercial fields
  {
    name: 'campaignTitle',
    label: 'Campaign Title',
    type: 'text',
    placeholder: 'Enter campaign title',
    required: true,
    showForTypes: ['commercial'],
  },
  {
    name: 'productionCompany',
    label: 'Production Company',
    type: 'text',
    placeholder: 'Enter production company',
    required: true,
    showForTypes: ['commercial'],
  },

  // Common fields
  {
    name: 'startDate',
    label: 'Start Date',
    type: 'date',
    required: true,
    showForTypes: ['tv-film', 'music-video', 'live-performance', 'commercial'],
  },
  {
    name: 'duration',
    label: 'Duration',
    type: 'select',
    options: DURATION_OPTIONS,
    required: true,
    showForTypes: ['tv-film', 'music-video', 'live-performance', 'commercial'],
  },
  {
    name: 'link',
    label: 'Link',
    type: 'text',
    placeholder: 'Paste link for project visual',
    showForTypes: ['tv-film', 'music-video', 'live-performance', 'commercial'],
  },
  {
    name: 'roles',
    label: 'Role',
    type: 'multiselect',
    options: COMMON_ROLES.map((r) => ({ label: r, value: r })),
    placeholder: 'Select your role(s)',
    required: true,
    showForTypes: ['tv-film', 'music-video', 'live-performance', 'commercial'],
  },
];

// Team fields (shown in Team tab)
export const TEAM_FIELDS: ExperienceFieldConfig[] = [
  {
    name: 'mainTalent',
    label: 'Main Talent',
    type: 'chips',
    placeholder: 'Add talent names',
    showForTypes: ['tv-film', 'music-video', 'live-performance', 'commercial'],
  },
  {
    name: 'choreographers',
    label: 'Choreographer(s)',
    type: 'chips',
    placeholder: 'Add choreographer names',
    showForTypes: ['tv-film', 'music-video', 'live-performance', 'commercial'],
  },
  {
    name: 'associateChoreographers',
    label: 'Assoc. Choreographer(s)',
    type: 'chips',
    placeholder: 'Add associate choreographer names',
    showForTypes: ['tv-film', 'music-video', 'live-performance', 'commercial'],
  },
];

// Helper function to get display title for an experience
export const getExperienceDisplayTitle = (experience: any): string => {
  switch (experience.type) {
    case 'tv-film':
      return experience.title || 'Untitled Project';
    case 'music-video':
      return experience.songTitle || 'Untitled Song';
    case 'live-performance':
      switch (experience.subtype) {
        case 'festival':
          return experience.festivalTitle || 'Festival';
        case 'tour':
          return experience.tourName || 'Tour';
        case 'theater':
          return experience.productionTitle || 'Theater Production';
        case 'award-show':
          return experience.awardShowName || 'Award Show';
        case 'corporate':
        case 'other':
          return experience.eventName || 'Event';
        case 'concert':
          return experience.venue || 'Concert';
        default:
          return 'Performance';
      }
    case 'commercial':
      return experience.campaignTitle || 'Commercial';
    default:
      return 'Experience';
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
