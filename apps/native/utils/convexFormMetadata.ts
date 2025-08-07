import { FormFieldConfig } from './convexSchemaToForm'
import { COMMON_STUDIOS, COMMON_ROLES, DURATION_OPTIONS } from '~/config/experienceTypes'

/**
 * Metadata for enhancing form fields with UI-specific configuration
 */
export interface FieldMetadata {
  component?: 'text' | 'select' | 'combobox' | 'chips' | 'date' | 'picker'
  placeholder?: string
  helpText?: string
  label?: string
  options?: Array<{ label: string; value: any }>
  suggestions?: string[]
  format?: string
  multiline?: boolean
  rows?: number
  min?: number
  max?: number
  step?: number
}

export type FormMetadata = Record<string, FieldMetadata>

/**
 * Apply metadata enhancements to form field configurations
 */
export function enhanceFieldsWithMetadata(
  fields: FormFieldConfig[],
  metadata: FormMetadata
): FormFieldConfig[] {
  return fields.map(field => {
    const fieldMeta = metadata[field.name]
    if (!fieldMeta) return field

    // Merge metadata into field config
    const enhanced: FormFieldConfig = {
      ...field,
      label: fieldMeta.label || field.label,
      placeholder: fieldMeta.placeholder || field.placeholder,
      helpText: fieldMeta.helpText || field.helpText,
      component: fieldMeta.component || field.component,
      metadata: {
        ...field.metadata,
        ...fieldMeta
      }
    }

    // Override component type if specified
    if (fieldMeta.component === 'combobox') {
      enhanced.type = 'combobox'
    } else if (fieldMeta.component === 'picker') {
      enhanced.type = 'select'
    }

    // Add options if provided
    if (fieldMeta.options) {
      enhanced.options = fieldMeta.options
    }

    // Add suggestions for combobox
    if (fieldMeta.suggestions && enhanced.type === 'combobox') {
      enhanced.options = fieldMeta.suggestions.map(s => ({ label: s, value: s }))
    }

    // Handle nested fields
    if (field.fields && field.fields.length > 0) {
      enhanced.fields = enhanceFieldsWithMetadata(field.fields, metadata)
    }

    return enhanced
  })
}

/**
 * TV/Film experience form metadata
 */
export const tvFilmMetadata: FormMetadata = {
  title: {
    placeholder: 'Enter the title of the TV show or film',
    helpText: 'Use the official title as it appears in credits'
  },
  studio: {
    component: 'combobox',
    placeholder: 'Select or enter production studio',
    suggestions: COMMON_STUDIOS,
    helpText: 'Major studio or production company'
  },
  startDate: {
    component: 'date',
    placeholder: 'Select start date',
    format: 'yyyy-MM-dd'
  },
  duration: {
    component: 'select',
    placeholder: 'How long did you work on this?',
    options: DURATION_OPTIONS
  },
  link: {
    placeholder: 'https://...',
    helpText: 'Link to trailer, IMDB, or official page'
  },
  roles: {
    component: 'chips',
    placeholder: 'Add your roles (e.g., Principal Dancer, Choreographer)',
    helpText: `Common roles: ${COMMON_ROLES.slice(0, 3).join(', ')}...`,
    suggestions: COMMON_ROLES
  },
  mainTalent: {
    component: 'chips',
    placeholder: 'Add main cast/talent names',
    helpText: 'Principal actors, performers, or talent'
  },
  choreographers: {
    component: 'chips',
    placeholder: 'Add choreographer names',
    helpText: 'Lead choreographers for the production'
  },
  associateChoreographers: {
    component: 'chips',
    placeholder: 'Add associate/assistant choreographer names'
  }
}

/**
 * Music Video experience form metadata
 */
export const musicVideoMetadata: FormMetadata = {
  songTitle: {
    placeholder: 'Enter the song title',
    helpText: 'Official song name'
  },
  artists: {
    component: 'chips',
    placeholder: 'Add artist names',
    helpText: 'All featured artists on the track'
  },
  startDate: {
    component: 'date',
    placeholder: 'Select production date',
    format: 'yyyy-MM-dd'
  },
  duration: {
    component: 'select',
    placeholder: 'Production duration',
    options: DURATION_OPTIONS
  },
  link: {
    placeholder: 'YouTube, Vevo, or official link',
    helpText: 'Link to the music video'
  },
  roles: {
    component: 'chips',
    placeholder: 'Add your roles',
    helpText: 'Your roles in the production',
    suggestions: COMMON_ROLES
  }
}

/**
 * Live Performance experience form metadata
 */
export const livePerformanceMetadata: FormMetadata = {
  eventType: {
    component: 'select',
    placeholder: 'Select event type',
    helpText: 'Type of live performance'
  },
  festivalTitle: {
    placeholder: 'Enter festival name',
    helpText: 'e.g., Coachella, Glastonbury'
  },
  tourName: {
    placeholder: 'Enter tour name',
    helpText: 'Official tour title'
  },
  tourArtist: {
    placeholder: 'Enter artist name',
    helpText: 'Headlining artist for the tour'
  },
  companyName: {
    placeholder: 'Enter company name',
    helpText: 'Corporate or production company'
  },
  eventName: {
    placeholder: 'Enter event name',
    helpText: 'Name of the specific event'
  },
  awardShowName: {
    placeholder: 'Enter award show name',
    helpText: 'e.g., Grammy Awards, MTV VMAs'
  },
  productionTitle: {
    placeholder: 'Enter production title',
    helpText: 'Theater or stage production name'
  },
  venue: {
    placeholder: 'Enter venue name',
    helpText: 'Performance venue or location'
  },
  startDate: {
    component: 'date',
    placeholder: 'Select start date',
    format: 'yyyy-MM-dd'
  },
  duration: {
    component: 'select',
    placeholder: 'Performance duration',
    options: DURATION_OPTIONS
  },
  roles: {
    component: 'chips',
    placeholder: 'Add your roles',
    suggestions: COMMON_ROLES
  }
}

/**
 * Commercial experience form metadata
 */
export const commercialMetadata: FormMetadata = {
  companyName: {
    placeholder: 'Enter brand or company name',
    helpText: 'The brand being advertised'
  },
  campaignTitle: {
    placeholder: 'Enter campaign or commercial title',
    helpText: 'Campaign name or commercial title'
  },
  productionCompany: {
    placeholder: 'Enter production company',
    helpText: 'Company that produced the commercial'
  },
  startDate: {
    component: 'date',
    placeholder: 'Select production date',
    format: 'yyyy-MM-dd'
  },
  duration: {
    component: 'select',
    placeholder: 'Production duration',
    options: DURATION_OPTIONS
  },
  link: {
    placeholder: 'Link to commercial',
    helpText: 'YouTube or official commercial link'
  },
  roles: {
    component: 'chips',
    placeholder: 'Add your roles',
    suggestions: COMMON_ROLES
  }
}

/**
 * User attribute form metadata
 */
export const userAttributeMetadata: FormMetadata = {
  ethnicity: {
    component: 'chips',
    placeholder: 'Select ethnicities',
    helpText: 'You can select multiple options'
  },
  hairColor: {
    component: 'select',
    placeholder: 'Select hair color'
  },
  eyeColor: {
    component: 'select',
    placeholder: 'Select eye color'
  },
  gender: {
    component: 'radio',
    helpText: 'Select your gender identity'
  },
  'height.feet': {
    component: 'text',
    placeholder: 'Feet',
    min: 3,
    max: 8
  },
  'height.inches': {
    component: 'text',
    placeholder: 'Inches',
    min: 0,
    max: 11
  },
  yearsOfExperience: {
    component: 'text',
    placeholder: 'Years',
    min: 0,
    max: 50
  }
}

/**
 * Get metadata for a specific experience type
 */
export function getExperienceMetadata(type: string): FormMetadata {
  switch (type) {
    case 'tv-film':
    case 'television-film':
      return tvFilmMetadata
    case 'music-video':
    case 'music-videos':
      return musicVideoMetadata
    case 'live-performance':
    case 'live-performances':
      return livePerformanceMetadata
    case 'commercial':
    case 'commercials':
      return commercialMetadata
    default:
      return {}
  }
}