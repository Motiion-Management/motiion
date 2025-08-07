import { z } from 'zod'

/**
 * Safe utility functions for accessing Zod schema properties
 * Prevents runtime errors from undefined or malformed schemas
 */

/**
 * Safely check if a value is a valid Zod schema
 */
export function isZodSchema(value: unknown): value is z.ZodTypeAny {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    '_def' in value &&
    typeof (value as any)._def === 'object'
  )
}

/**
 * Safely get the typename from a Zod schema
 */
export function getTypeName(schema: unknown): string | null {
  if (!isZodSchema(schema)) return null
  return schema._def?.typeName || null
}

/**
 * Safely extract the inner type from optional/nullable schemas
 */
export function unwrapOptional(schema: z.ZodTypeAny): z.ZodTypeAny {
  const typeName = getTypeName(schema)
  
  if (typeName === 'ZodOptional' && '_def' in schema && 'innerType' in schema._def) {
    return unwrapOptional((schema as z.ZodOptional<any>)._def.innerType)
  }
  
  if (typeName === 'ZodNullable' && '_def' in schema && 'innerType' in schema._def) {
    return unwrapOptional((schema as z.ZodNullable<any>)._def.innerType)
  }
  
  if (typeName === 'ZodDefault' && '_def' in schema && 'innerType' in schema._def) {
    return unwrapOptional((schema as z.ZodDefault<any>)._def.innerType)
  }
  
  return schema
}

/**
 * Type guard for checking if schema has checks array
 */
export function hasChecks(schema: unknown): schema is { _def: { checks: Array<{ kind: string }> } } {
  if (!isZodSchema(schema)) return false
  
  const def = (schema as any)._def
  return (
    def &&
    typeof def === 'object' &&
    'checks' in def &&
    Array.isArray(def.checks)
  )
}

/**
 * Safely check for email validation
 */
export function hasEmailCheck(schema: z.ZodTypeAny): boolean {
  if (!hasChecks(schema)) return false
  
  try {
    return (schema as any)._def.checks.some(
      (check: any) => check?.kind === 'email'
    )
  } catch {
    return false
  }
}

/**
 * Safely check for regex validation
 */
export function hasRegexCheck(schema: z.ZodTypeAny, pattern?: string): boolean {
  if (!hasChecks(schema)) return false
  
  try {
    return (schema as any)._def.checks.some((check: any) => {
      if (check?.kind !== 'regex') return false
      if (!pattern) return true
      
      const regex = check.regex
      if (!regex || typeof regex.source !== 'string') return false
      
      return regex.source.includes(pattern)
    })
  } catch {
    return false
  }
}

/**
 * Safely get the shape from a Zod object schema
 */
export function getObjectShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> | null {
  const typeName = getTypeName(schema)
  if (typeName !== 'ZodObject') return null
  
  try {
    // Try standard Zod shape property
    if ('shape' in schema && typeof schema.shape === 'object') {
      return schema.shape as Record<string, z.ZodTypeAny>
    }
    
    // Try _def.shape as function
    const def = (schema as any)._def
    if (def && typeof def.shape === 'function') {
      const shape = def.shape()
      if (shape && typeof shape === 'object') {
        return shape
      }
    }
    
    // Try _def.shape as object
    if (def && typeof def.shape === 'object') {
      return def.shape
    }
    
    return null
  } catch (error) {
    console.warn('Failed to extract shape from ZodObject:', error)
    return null
  }
}

/**
 * Safely detect Convex ID (zid) branded types
 */
export interface ConvexIdInfo {
  isConvexId: boolean
  tableName?: string
}

export function detectConvexId(schema: z.ZodTypeAny): ConvexIdInfo {
  try {
    const typeName = getTypeName(schema)
    
    // Check for ZodBranded (how zid is implemented)
    if (typeName === 'ZodBranded') {
      const def = (schema as any)._def
      
      // Check if it has the Convex ID brand
      if (def?.brand && typeof def.brand === 'object') {
        // Check for isConvexId marker
        if ('isConvexId' in def.brand && def.brand.isConvexId === true) {
          return {
            isConvexId: true,
            tableName: def.brand.tableName || 'unknown'
          }
        }
        
        // Alternative: check for zod.brand pattern used by convex-helpers
        // The brand might be a symbol or have a specific structure
        const innerType = def.type
        if (innerType && getTypeName(innerType) === 'ZodString') {
          // This is likely a branded string, could be a Convex ID
          // Check if brand has table information
          if ('tableName' in def.brand) {
            return {
              isConvexId: true,
              tableName: def.brand.tableName
            }
          }
        }
      }
    }
    
    // Check for union types that might contain Convex IDs
    if (typeName === 'ZodUnion') {
      const options = (schema as z.ZodUnion<any>)._def?.options
      if (Array.isArray(options)) {
        for (const option of options) {
          const result = detectConvexId(option)
          if (result.isConvexId) {
            return result
          }
        }
      }
    }
    
    // Unwrap optional/nullable and check again
    if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
      const inner = unwrapOptional(schema)
      if (inner !== schema) {
        return detectConvexId(inner)
      }
    }
    
  } catch (error) {
    console.warn('Error detecting Convex ID:', error)
  }
  
  return { isConvexId: false }
}

/**
 * Safely get enum values from a schema
 */
export function getEnumValues(schema: z.ZodTypeAny): string[] | null {
  try {
    const typeName = getTypeName(schema)
    
    if (typeName === 'ZodEnum') {
      const values = (schema as z.ZodEnum<any>)._def?.values
      if (Array.isArray(values)) {
        return values
      }
    }
    
    if (typeName === 'ZodNativeEnum') {
      const enumObj = (schema as z.ZodNativeEnum<any>)._def?.values
      if (enumObj && typeof enumObj === 'object') {
        return Object.values(enumObj).filter(
          v => typeof v === 'string'
        ) as string[]
      }
    }
    
    if (typeName === 'ZodLiteral') {
      const value = (schema as z.ZodLiteral<any>)._def?.value
      if (value !== undefined) {
        return [String(value)]
      }
    }
    
    return null
  } catch (error) {
    console.warn('Error extracting enum values:', error)
    return null
  }
}

/**
 * Safely get array element type
 */
export function getArrayElementType(schema: z.ZodTypeAny): z.ZodTypeAny | null {
  const typeName = getTypeName(schema)
  if (typeName !== 'ZodArray') return null
  
  try {
    const def = (schema as z.ZodArray<any>)._def
    if (def && 'type' in def && isZodSchema(def.type)) {
      return def.type
    }
  } catch (error) {
    console.warn('Error getting array element type:', error)
  }
  
  return null
}

/**
 * Extract validation rules without storing the full schema
 */
export interface ValidationRules {
  required: boolean
  type: string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  email?: boolean
  enumValues?: string[]
}

export function extractValidationRules(schema: z.ZodTypeAny): ValidationRules {
  const unwrapped = unwrapOptional(schema)
  const typeName = getTypeName(unwrapped) || 'unknown'
  
  const rules: ValidationRules = {
    required: isRequired(schema),
    type: typeName.replace('Zod', '').toLowerCase()
  }
  
  // Extract type-specific validation rules
  if (hasChecks(unwrapped)) {
    const checks = (unwrapped as any)._def.checks
    
    for (const check of checks) {
      switch (check.kind) {
        case 'min':
          rules.min = check.value
          break
        case 'max':
          rules.max = check.value
          break
        case 'length':
          if (check.min !== undefined) rules.minLength = check.min
          if (check.max !== undefined) rules.maxLength = check.max
          break
        case 'email':
          rules.email = true
          break
        case 'regex':
          if (check.regex?.source) {
            rules.pattern = check.regex.source
          }
          break
      }
    }
  }
  
  // Add enum values if present
  const enumValues = getEnumValues(unwrapped)
  if (enumValues) {
    rules.enumValues = enumValues
  }
  
  return rules
}

/**
 * Check if a schema is required (not optional/nullable)
 */
export function isRequired(schema: z.ZodTypeAny): boolean {
  const typeName = getTypeName(schema)
  
  if (typeName === 'ZodOptional') return false
  if (typeName === 'ZodNullable') return false
  if (typeName === 'ZodDefault') return false
  
  return true
}

/**
 * Safely get description from schema
 */
export function getDescription(schema: z.ZodTypeAny): string | null {
  try {
    const description = (schema as any)?._def?.description
    if (typeof description === 'string') {
      return description
    }
  } catch {
    // Ignore errors
  }
  
  return null
}