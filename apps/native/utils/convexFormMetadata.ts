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
    | 'year'
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
  // Mobile keyboard capitalization behavior
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
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
  // Conditional label override (supports single rule or array of rules)
  labelWhen?:
    | {
        field: string;
        equals?: any | any[];
        label: string;
      }
    | Array<{
        field: string;
        equals?: any | any[];
        label: string;
      }>;
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
    } else if (fieldMeta.component === 'year') {
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
// Exported so forms can always render the type selector before a type is chosen
export const baseExperienceMetadata: FormMetadata = {
  type: {
    component: 'picker',
    label: 'Experience Type',
    placeholder: 'Select experience type',
    options: [
      { label: 'Television & Film', value: 'tv-film' },
      { label: 'Music Video', value: 'music-video' },
      { label: 'Live Performance', value: 'live-performance' },
      { label: 'Commercial', value: 'commercial' },
    ],
    width: 'full',
    group: ['details', 'basic', 'quick'],
    order: 0,
  },
  title: {
    // Generic title shown for all experience types unless overridden
    component: 'text',
    placeholder: 'Project title',
    autoCapitalize: 'words',
    group: ['details', 'basic', 'quick'],
    order: 1,
  },
  startDate: {
    component: 'date',
    label: 'Start Date',
    placeholder: 'Select date',
    order: 3,
    format: 'yyyy-MM-dd',
    width: 'half',
    group: ['details', 'basic', 'dates'],
  },
  endDate: {
    component: 'date',
    label: 'End Date',
    placeholder: 'Select date',
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
    autoCapitalize: 'words',
  },
};

/**
 * TV/Film experience form metadata
 */
export const tvFilmMetadata: FormMetadata = {
  ...baseExperienceMetadata,
  studio: {
    component: 'combobox',
    placeholder: 'Select or enter production studio',
    suggestions: COMMON_STUDIOS,
    helpText: 'Major studio or production company',
    group: ['details', 'basic', 'quick'],
    order: 6,
    autoCapitalize: 'words',
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    label: 'Premier Date',
    placeholder: 'Select premier date',
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
    autoCapitalize: 'words',
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production',
    group: 'team',
    order: 9,
    autoCapitalize: 'words',
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names',
    group: 'team',
    order: 10,
    autoCapitalize: 'words',
  },
  directors: {
    component: 'chips',
    placeholder: 'Add director name(s)',
    helpText: 'Theater director for the production',
    group: 'team',
    order: 11,
    autoCapitalize: 'words',
  },
};

/**
 * Music Video experience form metadata
 */
export const musicVideoMetadata: FormMetadata = {
  ...baseExperienceMetadata,
  artists: {
    component: 'chips',
    group: ['details', 'basic', 'quick'],
    order: 6,
    placeholder: 'Add artist names',
    helpText: 'All featured artists on the track',
    autoCapitalize: 'words',
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    label: 'Premier Date',
    placeholder: 'Select premier date',
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
    autoCapitalize: 'words',
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production',
    group: 'team',
    order: 9,
    autoCapitalize: 'words',
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names',
    group: 'team',
    order: 10,
    autoCapitalize: 'words',
  },
  directors: {
    component: 'chips',
    placeholder: 'Add director name(s)',
    group: 'team',
    order: 11,
    autoCapitalize: 'words',
  },
};

/**
 * Live Performance experience form metadata
 */
export const livePerformanceMetadata: FormMetadata = {
  ...baseExperienceMetadata,
  subtype: {
    component: 'picker',
    label: 'Event Type',
    placeholder: 'Select event type',
    group: ['details', 'basic', 'quick'],
    order: 1,
    options: LIVE_EVENT_TYPES,
  },
  title: {
    placeholder: 'Enter title',
    group: ['details', 'basic', 'quick'],
    helpText: 'Name of the event or production',
    order: 2,
    autoCapitalize: 'words',
    labelWhen: [
      { field: 'subtype', equals: 'festival', label: 'Festival Name' },
      { field: 'subtype', equals: 'tour', label: 'Tour Name' },
      { field: 'subtype', equals: 'concert', label: 'Concert Name' },
      { field: 'subtype', equals: 'corporate', label: 'Event Name' },
      { field: 'subtype', equals: 'award-show', label: 'Award Show Name' },
      { field: 'subtype', equals: 'theater', label: 'Production Title' },
      { field: 'subtype', equals: 'other', label: 'Event Name' },
    ],
  },
  tourArtist: {
    placeholder: 'Enter artist name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Headlining artist for the tour',
    showWhen: { field: 'subtype', equals: 'tour' },
    autoCapitalize: 'words',
  },
  companyName: {
    placeholder: 'Enter company name',
    group: ['details', 'basic', 'quick'],
    helpText: 'Corporate or production company',
    showWhen: { field: 'subtype', equals: 'corporate' },
    autoCapitalize: 'words',
  },
  venue: {
    placeholder: 'Enter venue name',
    helpText: 'Performance venue or location',
    group: ['details', 'basic', 'quick'],
    showWhen: { field: 'subtype', equals: ['concert', 'theater'] },
    order: 2,
    autoCapitalize: 'words',
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    labelWhen: { field: 'subtype', equals: 'award-show', label: 'Date' },
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
    autoCapitalize: 'words',
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production',
    group: 'team',
    order: 9,
    autoCapitalize: 'words',
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names',
    group: 'team',
    order: 10,
    autoCapitalize: 'words',
  },
  directors: {
    component: 'chips',
    placeholder: 'Add director name(s)',
    helpText: 'Director(s) for the production or event',
    group: 'team',
    order: 11,
    autoCapitalize: 'words',
  },
};

/**
 * Commercial experience form metadata
 */
export const commercialMetadata: FormMetadata = {
  ...baseExperienceMetadata,
  companyName: {
    placeholder: 'Enter brand or company name',
    group: ['details', 'basic', 'quick'],
    helpText: 'The brand being advertised',
    autoCapitalize: 'words',
  },
  productionCompany: {
    placeholder: 'Enter production company',
    group: ['details', 'basic', 'quick'],
    helpText: 'Company that produced the commercial',
    autoCapitalize: 'words',
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    label: 'Premier Date',
    placeholder: 'Select premier date',
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
    autoCapitalize: 'words',
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production',
    group: 'team',
    order: 9,
    autoCapitalize: 'words',
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names',
    group: 'team',
    order: 10,
    autoCapitalize: 'words',
  },
  directors: {
    component: 'chips',
    placeholder: 'Add director name(s)',
    group: 'team',
    order: 11,
    autoCapitalize: 'words',
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

export const experienceMetadata: Record<string, FormMetadata> = {
  'tv-film': tvFilmMetadata,
  'music-video': musicVideoMetadata,
  'live-performance': livePerformanceMetadata,
  commercial: commercialMetadata,
};

// Initial state metadata: show only core fields and disable all except title
export const initialExperienceMetadata: FormMetadata = {
  ...baseExperienceMetadata,
  // Keep the field visible in groups but disabled
  type: {
    ...baseExperienceMetadata.type,
    // Keep type enabled so the user can choose it
    disabled: false,
  },
  title: {
    ...baseExperienceMetadata.title,
    // explicitly keep enabled
    disabled: false,
  },
  startDate: {
    ...baseExperienceMetadata.startDate,
    disabled: true,
  },
  endDate: {
    ...baseExperienceMetadata.endDate,
    disabled: true,
  },
  duration: {
    ...baseExperienceMetadata.duration,
    disabled: true,
  },
  roles: {
    ...baseExperienceMetadata.roles,
    disabled: true,
  },
};

/**
 * Base training form metadata
 */
export const baseTrainingMetadata: FormMetadata = {
  type: {
    component: 'picker',
    label: 'Training Type',
    placeholder: 'Select training type',
    options: [
      { label: 'Education', value: 'education' },
      { label: 'Dance School', value: 'dance-school' },
      { label: 'Programs & Intensives', value: 'programs-intensives' },
      { label: 'Scholarships', value: 'scholarships' },
      { label: 'Other', value: 'other' },
    ],
    width: 'full',
    group: 'details',
    order: 0,
  },
  institution: {
    component: 'text',
    label: 'Institution',
    placeholder: 'Enter institution',
    autoCapitalize: 'words',
    group: 'details',
    order: 1,
  },
  degree: {
    component: 'text',
    label: 'Degree',
    placeholder: 'Enter degree (e.g., BFA, BA)',
    autoCapitalize: 'words',
    group: 'details',
    order: 2,
    showWhen: { field: 'type', equals: 'education' },
  },
  instructors: {
    component: 'chips',
    label: 'Instructors',
    placeholder: 'Add instructor names',
    helpText: 'The teachers you studied under',
    autoCapitalize: 'words',
    group: 'details',
    order: 3,
  },
  startYear: {
    component: 'year',
    label: 'Year Start',
    placeholder: 'Select year',
    width: 'half',
    group: 'details',
    order: 4,
  },
  endYear: {
    component: 'year',
    label: 'Year End',
    placeholder: 'Select year',
    width: 'half',
    group: 'details',
    order: 5,
  },
};

/**
 * Education training metadata
 */
export const educationTrainingMetadata: FormMetadata = {
  ...baseTrainingMetadata,
  institution: {
    ...baseTrainingMetadata.institution,
    label: 'School Name',
    placeholder: 'Enter school name',
  },
};

/**
 * Dance School training metadata
 */
export const danceSchoolTrainingMetadata: FormMetadata = {
  ...baseTrainingMetadata,
  institution: {
    ...baseTrainingMetadata.institution,
    label: 'Studio Name',
    placeholder: 'Enter studio name',
  },
  // degree field omitted for dance schools
};

/**
 * Programs & Intensives training metadata
 */
export const programsTrainingMetadata: FormMetadata = {
  ...baseTrainingMetadata,
  institution: {
    ...baseTrainingMetadata.institution,
    label: 'Program Name',
    placeholder: 'Enter program name',
  },
  // degree field omitted
};

/**
 * Scholarships training metadata
 */
export const scholarshipsTrainingMetadata: FormMetadata = {
  ...baseTrainingMetadata,
  institution: {
    ...baseTrainingMetadata.institution,
    label: 'Organization',
    placeholder: 'Enter organization name',
  },
  // degree field omitted
};

/**
 * Other training metadata
 */
export const otherTrainingMetadata: FormMetadata = {
  ...baseTrainingMetadata,
  // degree field omitted
};

/**
 * Map of training type to metadata
 */
export const trainingMetadata: Record<string, FormMetadata> = {
  education: educationTrainingMetadata,
  'dance-school': danceSchoolTrainingMetadata,
  'programs-intensives': programsTrainingMetadata,
  scholarships: scholarshipsTrainingMetadata,
  other: otherTrainingMetadata,
};

/**
 * Initial training metadata (only type selector enabled)
 */
export const initialTrainingMetadata: FormMetadata = {
  ...baseTrainingMetadata,
  type: {
    ...baseTrainingMetadata.type,
    disabled: false,
  },
  institution: {
    ...baseTrainingMetadata.institution,
    disabled: true,
  },
  degree: {
    ...baseTrainingMetadata.degree,
    disabled: true,
  },
  instructors: {
    ...baseTrainingMetadata.instructors,
    disabled: true,
  },
  startYear: {
    ...baseTrainingMetadata.startYear,
    disabled: true,
  },
  endYear: {
    ...baseTrainingMetadata.endYear,
    disabled: true,
  },
};
