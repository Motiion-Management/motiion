import { FormFieldConfig } from './convexSchemaToForm';
import { COMMON_STUDIOS, COMMON_ROLES, DURATION_OPTIONS } from '~/config/experienceTypes';

/**
 * Metadata for enhancing form fields with UI-specific configuration
 */
export interface FieldMetadata {
  component?:
  | 'text'
  | 'select'
  | 'combobox'
  | 'chips'
  | 'date'
  | 'picker'
  | 'radio'
  | 'checkbox'
  | 'number';
  placeholder?: string;
  helpText?: string;
  label?: string;
  options?: Array<{ label: string; value: any }>;
  suggestions?: string[];
  format?: string;
  multiline?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  // Layout properties
  width?: 'full' | 'half' | 'third';
  order?: number;
  // Grouping for tabs/sections
  group?: string | string[];
  // Field state
  readOnly?: boolean;
  disabled?: boolean;
}

export type FormMetadata = Record<string, FieldMetadata>;

/**
 * Apply metadata enhancements to form field configurations
 */
export function enhanceFieldsWithMetadata(
  fields: FormFieldConfig[],
  metadata: FormMetadata
): FormFieldConfig[] {
  return fields.map((field) => {
    const fieldMeta = metadata[field.name];
    if (!fieldMeta) return field;

    // Merge metadata into field config
    const enhanced: FormFieldConfig = {
      ...field,
      label: fieldMeta.label || field.label,
      placeholder: fieldMeta.placeholder || field.placeholder,
      helpText: fieldMeta.helpText || field.helpText,
      component: fieldMeta.component || field.component,
      metadata: {
        ...field.metadata,
        ...fieldMeta,
      },
    };

    // Override component type if specified
    if (fieldMeta.component === 'combobox') {
      enhanced.type = 'combobox';
    } else if (fieldMeta.component === 'picker') {
      enhanced.type = 'select';
    } else if (fieldMeta.component === 'date') {
      enhanced.type = 'date';
    } else if (fieldMeta.component === 'radio') {
      enhanced.type = 'radio';
    } else if (fieldMeta.component === 'checkbox') {
      enhanced.type = 'checkbox';
    } else if (fieldMeta.component === 'number') {
      enhanced.type = 'number';
    } else if (fieldMeta.component === 'chips') {
      enhanced.type = 'chips';
    }

    // Add options if provided
    if (fieldMeta.options) {
      enhanced.options = fieldMeta.options;
    }

    // Add suggestions for combobox
    if (fieldMeta.suggestions && enhanced.type === 'combobox') {
      enhanced.options = fieldMeta.suggestions.map((s) => ({ label: s, value: s }));
    }

    // Handle nested fields
    if (field.fields && field.fields.length > 0) {
      enhanced.fields = enhanceFieldsWithMetadata(field.fields, metadata);
    }

    return enhanced;
  });
}

/**
 * TV/Film experience form metadata
 */
export const tvFilmMetadata: FormMetadata = {
  title: {
    placeholder: 'Project title',
    // helpText: 'Use the official title as it appears in credits',
    group: ['details', 'basic', 'quick'],
    order: 2,
  },
  studio: {
    component: 'combobox',
    placeholder: 'Select or enter production studio',
    suggestions: COMMON_STUDIOS,
    helpText: 'Major studio or production company',
    group: ['details', 'basic', 'quick'],
    order: 3,
  },
  startDate: {
    component: 'date',
    label: 'Premier Date',
    placeholder: 'Select start date',
    format: 'yyyy-MM-dd',
    width: 'half',
    group: ['details', 'basic', 'dates'],
    order: 4,
  },
  duration: {
    component: 'picker',
    helpText:
      'This is the total time you worked on this project, including rehearsals',
    placeholder: 'How long did you work on this?',
    options: DURATION_OPTIONS,
    width: 'half',
    group: ['details', 'basic', 'dates'],
    order: 5,
  },
  link: {
    placeholder: 'Paste link for project visual...',
    helpText: 'Link to trailer, IMDB, or official page',
    group: ['details', 'basic', 'media'],
    order: 6,
  },
  roles: {
    component: 'chips',
    label: 'Role',
    placeholder: 'Start typing to add a role...',
    // helpText: `Common roles: ${COMMON_ROLES.slice(0, 3).join(', ')}...`,
    suggestions: COMMON_ROLES,
    group: ['details', 'basic', 'quick'],
    order: 7,
  },
  mainTalent: {
    component: 'chips',
    placeholder: 'Add main cast/talent names',
    helpText: 'Principal actors, performers, or talent',
    group: 'team',
    order: 8,
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production',
    group: 'team',
    order: 9,
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names',
    group: 'team',
    order: 10,
  },
  directors: {
    component: 'chips',
    placeholder: 'Add director name(s)',
    helpText: 'Theater director for the production',
    group: 'team',
    order: 11,
  },
};

/**
 * Music Video experience form metadata
 */
export const musicVideoMetadata: FormMetadata = {
  songTitle: {
    group: ['details', 'basic', 'quick'],
    order: 2,
    placeholder: 'Enter the song title',
    helpText: 'Official song name',
  },
  artists: {
    component: 'chips',
    group: ['details', 'basic', 'quick'],
    order: 3,
    placeholder: 'Add artist names',
    helpText: 'All featured artists on the track',
  },
  startDate: {
    component: 'date',
    label: 'Premier Date',
    placeholder: 'Select premier date',
    format: 'yyyy-MM-dd',
    width: 'half',
    group: ['details', 'basic', 'dates'],
    order: 4,
  },
  duration: {
    component: 'picker',
    helpText:
      'This is the total time you worked on this project, including rehearsals',
    placeholder: 'Production duration',
    options: DURATION_OPTIONS,
    width: 'half',
    group: ['details', 'basic', 'dates'],
    order: 5,
  },
  link: {
    placeholder: 'YouTube, Vevo, or official link',
    helpText: 'Link to the music video',
    group: ['details', 'basic', 'media'],
    order: 6,
  },
  roles: {
    component: 'chips',
    label: 'Role',
    placeholder: 'Add your roles',
    helpText: 'Your roles in the production',
    suggestions: COMMON_ROLES,
    group: ['details', 'basic', 'quick'],
    order: 7,
  },
  // Team
  mainTalent: {
    component: 'chips',
    placeholder: 'Add main cast/talent names',
    helpText: 'Principal performers or talent',
    group: 'team',
    order: 8,
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production',
    group: 'team',
    order: 9,
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names',
    group: 'team',
    order: 10,
  },
  directors: {
    component: 'chips',
    placeholder: 'Add director name(s)',
    group: 'team',
    order: 11,
  },
};

/**
 * Live Performance experience form metadata
 */
export const livePerformanceMetadata: FormMetadata = {
  subtype: {
    component: 'select',
    placeholder: 'Select event type',
    helpText: 'Type of live performance',
    group: ['details', 'basic', 'quick'],
    order: 1,
  },
  festivalTitle: {
    placeholder: 'Enter festival name',
    group: ['details', 'basic', 'quick'],
    helpText: 'e.g., Coachella, Glastonbury',
  },
  tourName: {
    placeholder: 'Enter tour name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Official tour title',
  },
  tourArtist: {
    placeholder: 'Enter artist name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Headlining artist for the tour',
  },
  companyName: {
    placeholder: 'Enter company name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Corporate or production company',
  },
  eventName: {
    placeholder: 'Enter event name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Name of the specific event',
  },
  awardShowName: {
    label: 'Award Show Title',
    placeholder: 'Enter award show name',
    helpText: 'e.g., Grammy Awards, MTV VMAs',
    group: ['details', 'basic', 'quick'],
  },
  productionTitle: {
    placeholder: 'Enter production title',
    helpText: 'Theater or stage production name',
    group: ['details', 'basic', 'quick'],
  },
  venue: {
    placeholder: 'Enter venue name',
    helpText: 'Performance venue or location',
    group: ['details', 'basic', 'quick'],
  },
  startDate: {
    component: 'date',
    placeholder: 'Select start date',
    format: 'yyyy-MM-dd',
    width: 'half',
    group: ['details', 'basic', 'dates'],
    order: 4,
  },
  duration: {
    component: 'picker',
    helpText:
      'This is the total time you worked on this project, including rehearsals',
    placeholder: 'Performance duration',
    options: DURATION_OPTIONS,
    width: 'half',
    group: ['details', 'basic', 'dates'],
    order: 5,
  },
  roles: {
    component: 'chips',
    label: 'Role',
    placeholder: 'Add your roles',
    suggestions: COMMON_ROLES,
    group: ['details', 'basic', 'quick'],
    order: 6,
  },
  // Team
  mainTalent: {
    component: 'chips',
    placeholder: 'Add main cast/talent names',
    helpText: 'Principal performers or talent',
    group: 'team',
    order: 8,
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production',
    group: 'team',
    order: 9,
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names',
    group: 'team',
    order: 10,
  },
};

/**
 * Commercial experience form metadata
 */
export const commercialMetadata: FormMetadata = {
  companyName: {
    placeholder: 'Enter brand or company name',
    group: ['details', 'basic', 'quick'],
    helpText: 'The brand being advertised',
  },
  campaignTitle: {
    placeholder: 'Enter campaign or commercial title',
    group: ['details', 'basic', 'quick'],
    helpText: 'Campaign name or commercial title',
  },
  productionCompany: {
    placeholder: 'Enter production company',
    group: ['details', 'basic', 'quick'],
    helpText: 'Company that produced the commercial',
  },
  startDate: {
    component: 'date',
    label: 'Premier Date',
    placeholder: 'Select premier date',
    format: 'yyyy-MM-dd',
    width: 'half',
    group: ['details', 'basic', 'dates'],
    order: 4,
  },
  duration: {
    component: 'picker',
    helpText:
      'This is the total time you worked on this project, including rehearsals',
    placeholder: 'Production duration',
    options: DURATION_OPTIONS,
    width: 'half',
    group: ['details', 'basic', 'dates'],
    order: 5,
  },
  link: {
    placeholder: 'Link to commercial',
    helpText: 'YouTube or official commercial link',
    group: ['details', 'basic', 'media'],
    order: 6,
  },
  roles: {
    component: 'chips',
    label: 'Role',
    placeholder: 'Add your roles',
    suggestions: COMMON_ROLES,
    group: ['details', 'basic', 'quick'],
    order: 7,
  },
  // Team
  mainTalent: {
    component: 'chips',
    placeholder: 'Add main cast/talent names',
    helpText: 'Principal performers or talent',
    group: 'team',
    order: 8,
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production',
    group: 'team',
    order: 9,
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names',
    group: 'team',
    order: 10,
  },
  directors: {
    component: 'chips',
    placeholder: 'Add director name(s)',
    group: 'team',
    order: 11,
  },
};

/**
 * User attribute form metadata
 */
export const userAttributeMetadata: FormMetadata = {
  ethnicity: {
    component: 'chips',
    placeholder: 'Select ethnicities',
    helpText: 'You can select multiple options',
  },
  hairColor: {
    component: 'select',
    placeholder: 'Select hair color',
  },
  eyeColor: {
    component: 'select',
    placeholder: 'Select eye color',
  },
  gender: {
    component: 'radio',
    helpText: 'Select your gender identity',
  },
  'height.feet': {
    component: 'text',
    placeholder: 'Feet',
    min: 3,
    max: 8,
  },
  'height.inches': {
    component: 'text',
    placeholder: 'Inches',
    min: 0,
    max: 11,
  },
  yearsOfExperience: {
    component: 'text',
    placeholder: 'Years',
    min: 0,
    max: 50,
  },
};

/**
 * Get metadata for a specific experience type
 */
export function getExperienceMetadata(type: string): FormMetadata {
  switch (type) {
    case 'tv-film':
    case 'television-film':
      return tvFilmMetadata;
    case 'music-video':
    case 'music-videos':
      return musicVideoMetadata;
    case 'live-performance':
    case 'live-performances':
      return livePerformanceMetadata;
    case 'commercial':
    case 'commercials':
      return commercialMetadata;
    default:
      return {};
  }
}
