import { z } from 'zod'
import { 
  isZodSchema, 
  getTypeName, 
  getObjectShape, 
  unwrapOptional,
  getEnumValues,
  isRequired 
} from './zodSafeAccess'
import { type FormFieldConfig } from './convexSchemaToForm'
import { getDiscriminatedUnionInfo } from './zodSafeAccess'

/**
 * Extract default values from a Zod schema
 * Handles discriminated unions, objects, and primitive types
 */
export function getDefaultsFromSchema(
  schema: z.ZodTypeAny,
  discriminatorValue?: string
): Record<string, any> {
  if (!isZodSchema(schema)) {
    return {}
  }

  const defaults: Record<string, any> = {}
  
  // Check for discriminated union
  const duInfo = getDiscriminatedUnionInfo(schema)
  if (duInfo && discriminatorValue) {
    // Set discriminator value
    defaults[duInfo.discriminator] = discriminatorValue
    
    // Find the matching branch
    const branch = duInfo.options.find(opt => opt.value === discriminatorValue)
    if (branch && branch.schema) {
      // Get defaults from the selected branch
      const branchDefaults = getDefaultsFromObjectSchema(branch.schema)
      return { ...defaults, ...branchDefaults }
    }
  }
  
  // Handle regular object schema
  const shape = getObjectShape(schema)
  if (shape) {
    return getDefaultsFromObjectSchema(schema)
  }
  
  return defaults
}

/**
 * Get defaults from an object schema
 */
function getDefaultsFromObjectSchema(schema: z.ZodTypeAny): Record<string, any> {
  const defaults: Record<string, any> = {}
  const shape = getObjectShape(schema)
  
  if (!shape) return defaults
  
  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    if (!isZodSchema(fieldSchema)) continue
    
    // Skip if not required (undefined is valid)
    if (!isRequired(fieldSchema)) {
      continue
    }
    
    const defaultValue = getFieldDefaultValue(fieldSchema)
    if (defaultValue !== undefined) {
      defaults[fieldName] = defaultValue
    }
  }
  
  return defaults
}

/**
 * Get default value for a single field based on its type
 */
function getFieldDefaultValue(schema: z.ZodTypeAny): any {
  if (!isZodSchema(schema)) return undefined
  
  // Unwrap optional/nullable/default
  const unwrapped = unwrapOptional(schema)
  const typeName = getTypeName(unwrapped)
  
  // Check for explicit default
  if (typeName === 'ZodDefault') {
    const defaultValue = (unwrapped as any)?._def?.defaultValue
    if (typeof defaultValue === 'function') {
      try {
        return defaultValue()
      } catch {
        // Fall through to type-based defaults
      }
    } else if (defaultValue !== undefined) {
      return defaultValue
    }
  }
  
  // Type-based defaults
  switch (typeName) {
    case 'ZodString':
      return ''
    case 'ZodNumber':
      return undefined // Let the user provide a value
    case 'ZodBoolean':
      return false
    case 'ZodArray':
      return []
    case 'ZodObject':
      return {}
    case 'ZodDate':
      return undefined // Let the user pick a date
    case 'ZodEnum':
    case 'ZodNativeEnum': {
      const enumValues = getEnumValues(unwrapped)
      return enumValues && enumValues.length > 0 ? enumValues[0] : undefined
    }
    case 'ZodLiteral':
      return (unwrapped as any)?._def?.value
    default:
      return undefined
  }
}

/**
 * Merge form default values with initial data
 * Handles date conversion and preserves existing values
 */
export function mergeFormValues(
  defaults: Record<string, any>,
  initialData: Record<string, any> | undefined,
  fields: FormFieldConfig[]
): Record<string, any> {
  if (!initialData) return defaults
  
  const merged = { ...defaults }
  
  // Only merge values for fields that exist in the form
  const fieldNames = new Set(fields.map(f => f.name))
  
  for (const [key, value] of Object.entries(initialData)) {
    if (!fieldNames.has(key)) continue
    
    // Skip undefined/null values from initial data
    if (value === undefined || value === null) continue
    
    // Handle dates - ensure they're Date objects
    const field = fields.find(f => f.name === key)
    if (field?.type === 'date' && typeof value === 'string') {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        merged[key] = date
      }
    } else {
      merged[key] = value
    }
  }
  
  return merged
}

/**
 * Get default values for form fields based on their configuration
 * This is used when we have fields but no schema
 */
export function getDefaultsFromFields(fields: FormFieldConfig[]): Record<string, any> {
  const defaults: Record<string, any> = {}
  
  for (const field of fields) {
    // Skip if field already has a value
    if (defaults[field.name] !== undefined) continue
    
    // Option-driven defaults: select/radio/picker default to first option
    if (
      (field.type === 'select' || field.type === 'radio' || field.component === 'picker') &&
      field.options &&
      field.options.length > 0
    ) {
      defaults[field.name] = field.options[0].value
      continue
    }
    
    // Type-based defaults
    switch (field.type) {
      case 'checkbox':
        defaults[field.name] = false
        break
      case 'chips':
      case 'multiselect':
        defaults[field.name] = []
        break
      case 'number':
        defaults[field.name] = field.metadata?.min ?? undefined
        break
      case 'object':
        defaults[field.name] = {}
        break
      case 'date':
        defaults[field.name] = undefined // Let user pick
        break
      default:
        defaults[field.name] = ''
    }
  }
  
  return defaults
}