import { FormFieldConfig } from './convexSchemaToForm';
import {
  COMMON_STUDIOS,
  COMMON_ROLES,
  DURATION_OPTIONS,
  LIVE_EVENT_TYPES,
} from '~/config/experienceTypes';

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
  // Conditional visibility
  showWhen?: {
    field: string;
    equals?: any | any[];
    in?: any[];
  };
  // Field state
  readOnly?: boolean;
  disabled?: boolean;
  // Conditional disabling based on other field values
  disabledWhen?: {
    field: string;
    isEmpty?: boolean;
    equals?: any | any[];
  };
  // Conditional label override
  labelWhen?: {
    field: string;
    equals?: any | any[];
    label: string;
  };
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

// Shared base metadata for Experiences; specific types can extend/override
const baseExperienceMetadata: FormMetadata = {
  startDate: {
    component: 'date',
    format: 'yyyy-MM-dd',
    width: 'half',
    group: ['details', 'basic', 'dates'],
  },
  endDate: {
    component: 'date',
    label: 'End Date',
    placeholder: 'Select end date',
    format: 'yyyy-MM-dd',
    width: 'half',
    group: ['details', 'basic', 'dates'],
    disabledWhen: { field: 'startDate', isEmpty: true },
  },
  duration: {
    component: 'picker',
    helpText: 'Total time rehearsing & performing.',
    options: DURATION_OPTIONS,
    width: 'full',
    group: ['details', 'basic', 'dates'],
  },
  roles: {
    component: 'chips',
    label: 'Role',
    suggestions: COMMON_ROLES,
    group: ['details', 'basic', 'quick'],
  },
};

/**
 * TV/Film experience form metadata
 */
export const tvFilmMetadata: FormMetadata = {
  title: {
    placeholder: 'Project title',
    // helpText: 'Use the official title as it appears in credits',
    group: ['details', 'basic', 'quick'],
    order: 1,
  },
  studio: {
    component: 'combobox',
    placeholder: 'Select or enter production studio',
    suggestions: COMMON_STUDIOS,
    helpText: 'Major studio or production company',
    group: ['details', 'basic', 'quick'],
    order: 6,
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    label: 'Premier Date',
    placeholder: 'Select start date',
    order: 3,
  },
  duration: {
    ...baseExperienceMetadata.duration,
    placeholder: 'How long did you work on this?',
    order: 2,
  },
  link: {
    placeholder: 'Paste link for project visual...',
    helpText: 'Link to trailer, IMDB, or official page',
    group: ['details', 'basic', 'media'],
    order: 8,
  },
  roles: {
    ...baseExperienceMetadata.roles,
    placeholder: 'Start typing to add a role...',
    order: 9,
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
    order: 1,
    placeholder: 'Enter the song title',
    helpText: 'Official song name',
  },
  artists: {
    component: 'chips',
    group: ['details', 'basic', 'quick'],
    order: 6,
    placeholder: 'Add artist names',
    helpText: 'All featured artists on the track',
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    label: 'Premier Date',
    placeholder: 'Select premier date',
    order: 3,
  },
  duration: {
    ...baseExperienceMetadata.duration,
    placeholder: 'Production duration',
    order: 2,
  },
  link: {
    placeholder: 'YouTube, Vevo, or official link',
    helpText: 'Link to the music video',
    group: ['details', 'basic', 'media'],
    order: 7,
  },
  roles: {
    ...baseExperienceMetadata.roles,
    placeholder: 'Add your roles',
    helpText: 'Your roles in the production',
    order: 8,
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
    component: 'picker',
    label: 'Event Type',
    placeholder: 'Select event type',
    group: ['details', 'basic', 'quick'],
    order: 1,
    options: LIVE_EVENT_TYPES,
  },
  festivalTitle: {
    placeholder: 'Enter festival name',
    group: ['details', 'basic', 'quick'],
    helpText: 'e.g., Coachella, Glastonbury',
    showWhen: { field: 'subtype', equals: 'festival' },
    order: 2,
  },
  tourName: {
    placeholder: 'Enter tour name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Official tour title',
    showWhen: { field: 'subtype', equals: 'tour' },
    order: 2,
  },
  tourArtist: {
    placeholder: 'Enter artist name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Headlining artist for the tour',
    showWhen: { field: 'subtype', equals: 'tour' },
  },
  companyName: {
    placeholder: 'Enter company name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Corporate or production company',
    showWhen: { field: 'subtype', equals: 'corporate' },
  },
  eventName: {
    placeholder: 'Enter event name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Name of the specific event',
    showWhen: { field: 'subtype', equals: ['corporate', 'other'] },
    order: 2,
  },
  awardShowName: {
    label: 'Award Show Title',
    placeholder: 'Enter award show name',
    helpText: 'e.g., Grammy Awards, MTV VMAs',
    group: ['details', 'basic', 'quick'],
    showWhen: { field: 'subtype', equals: 'award-show' },
    order: 2,
  },
  productionTitle: {
    placeholder: 'Enter production title',
    helpText: 'Theater or stage production name',
    group: ['details', 'basic', 'quick'],
    showWhen: { field: 'subtype', equals: 'theater' },
    order: 2,
  },
  venue: {
    placeholder: 'Enter venue name',
    helpText: 'Performance venue or location',
    group: ['details', 'basic', 'quick'],
    showWhen: { field: 'subtype', equals: ['concert', 'theater'] },
    order: 2,
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    label: 'Start Date',
    labelWhen: { field: 'subtype', equals: 'award-show', label: 'Date' },
    placeholder: 'Select start date',
    order: 4,
  },
  endDate: {
    ...baseExperienceMetadata.endDate,
    order: 5,
    showWhen: {
      field: 'subtype',
      in: ['festival', 'tour', 'concert', 'corporate', 'theater', 'other'],
    },
  },
  duration: {
    ...baseExperienceMetadata.duration,
    placeholder: 'Performance duration',
    order: 3,
  },
  roles: {
    ...baseExperienceMetadata.roles,
    placeholder: 'Add your roles',
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
    order: 1,
  },
  productionCompany: {
    placeholder: 'Enter production company',
    group: ['details', 'basic', 'quick'],
    helpText: 'Company that produced the commercial',
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    label: 'Premier Date',
    placeholder: 'Select premier date',
    order: 3,
  },
  duration: {
    ...baseExperienceMetadata.duration,
    placeholder: 'Production duration',
    order: 2,
  },
  link: {
    placeholder: 'Link to commercial',
    helpText: 'YouTube or official commercial link',
    group: ['details', 'basic', 'media'],
    order: 7,
  },
  roles: {
    ...baseExperienceMetadata.roles,
    placeholder: 'Add your roles',
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
