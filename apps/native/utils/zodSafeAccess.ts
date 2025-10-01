import { z } from 'zod';
import { registryHelpers } from 'zodvex';

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
  );
}

/**
 * Safely get the typename from a Zod schema
 */
export function getTypeName(schema: unknown): string | null {
  if (!isZodSchema(schema)) return null;
  const def = (schema as any)._def;
  return def?.typeName || null;
}

/**
 * Deeply unwrap Zod v4 wrappers to reveal the base runtime type.
 * Handles: Optional/Nullable/Default/Catch, Branded, Pipeline/Pipe/Transform, Effects (v3 legacy)
 */
export function unwrapAll(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current: any = schema;
  const seen = new Set<any>();

  while (isZodSchema(current) && !seen.has(current)) {
    seen.add(current);

    // First peel optional/nullable/default using existing helper
    const afterBasic = unwrapOptional(current);
    if (afterBasic !== current) {
      current = afterBasic;
      continue;
    }

    const typeName = getTypeName(current);
    const def: any = (current as any)?._def;

    // Branded → follow inner type
    if (typeName === 'ZodBranded' && def?.type && isZodSchema(def.type)) {
      current = def.type;
      continue;
    }

    // Pipeline/Pipe/Transform (v4)
    if (typeName === 'ZodPipeline' || typeName === 'ZodPipe' || typeName === 'ZodTransform') {
      const inner = def?.innerType || def?.left || def?.schema;
      if (isZodSchema(inner)) {
        current = inner;
        continue;
      }
    }

    // Effects (v3 legacy)
    if (typeName === 'ZodEffects' && def?.schema && isZodSchema(def.schema)) {
      current = def.schema;
      continue;
    }

    // Catch-all: if any common inner property exists, follow it
    const fallback = def?.type || def?.schema || def?.innerType || def?.left;
    if (isZodSchema(fallback)) {
      current = fallback;
      continue;
    }

    break;
  }

  return current as z.ZodTypeAny;
}

/**
 * Safely extract the inner type from optional/nullable schemas
 */
export function unwrapOptional(schema: z.ZodTypeAny): z.ZodTypeAny {
  const typeName = getTypeName(schema);

  if (typeName === 'ZodOptional' && '_def' in schema && 'innerType' in schema._def) {
    return unwrapOptional((schema as z.ZodOptional<any>)._def.innerType);
  }

  if (typeName === 'ZodNullable' && '_def' in schema && 'innerType' in schema._def) {
    return unwrapOptional((schema as z.ZodNullable<any>)._def.innerType);
  }

  if (typeName === 'ZodDefault' && '_def' in schema && 'innerType' in schema._def) {
    return unwrapOptional((schema as z.ZodDefault<any>)._def.innerType);
  }

  return schema;
}

/**
 * Type guard for checking if schema has checks array
 */
export function hasChecks(
  schema: unknown
): schema is { _def: { checks: Array<{ kind: string }> } } {
  if (!isZodSchema(schema)) return false;

  const def = (schema as any)._def;
  return def && typeof def === 'object' && 'checks' in def && Array.isArray(def.checks);
}

/**
 * Safely check for email validation
 */
export function hasEmailCheck(schema: z.ZodTypeAny): boolean {
  const base = unwrapAll(schema);
  if (!hasChecks(base)) return false;

  try {
    return (base as any)._def.checks.some((check: any) => check?.kind === 'email');
  } catch {
    return false;
  }
}

/**
 * Safely check for regex validation
 */
export function hasRegexCheck(schema: z.ZodTypeAny, pattern?: string): boolean {
  const base = unwrapAll(schema);
  if (!hasChecks(base)) return false;

  try {
    return (base as any)._def.checks.some((check: any) => {
      if (check?.kind !== 'regex') return false;
      if (!pattern) return true;

      const regex = check.regex;
      if (!regex || typeof regex.source !== 'string') return false;

      return regex.source.includes(pattern);
    });
  } catch {
    return false;
  }
}

/** Detect Zod v4 string().datetime() */
export function hasDatetimeCheck(schema: z.ZodTypeAny): boolean {
  const base = unwrapAll(schema);
  if (!hasChecks(base)) return false;
  try {
    return (base as any)._def.checks.some((check: any) => check?.kind === 'datetime');
  } catch {
    return false;
  }
}

/**
 * Safely get the shape from a Zod object schema
 */
export function getObjectShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> | null {
  const typeName = getTypeName(schema);
  if (typeName !== 'ZodObject' && typeName !== 'ZodInterface') return null;

  try {
    // Try standard Zod shape property
    if ('shape' in schema && typeof schema.shape === 'object') {
      return schema.shape as Record<string, z.ZodTypeAny>;
    }

    // Try _def.shape as function
    const def = (schema as any)._def;
    if (def && typeof def.shape === 'function') {
      const shape = def.shape();
      if (shape && typeof shape === 'object') {
        return shape;
      }
    }

    // Try _def.shape as object
    if (def && typeof def.shape === 'object') {
      return def.shape;
    }

    return null;
  } catch (error) {
    console.warn('Failed to extract shape from ZodObject:', error);
    return null;
  }
}

/**
 * Safely detect Convex ID (zid) branded types
 */
export interface ConvexIdInfo {
  isConvexId: boolean;
  tableName?: string;
}

export function detectConvexId(schema: z.ZodTypeAny): ConvexIdInfo {
  try {
    const typeName = getTypeName(schema);

    // zodvex zid adds a _tableName marker on the branded type
    const tableNameProp = (schema as any)?._tableName;
    if (typeof tableNameProp === 'string' && tableNameProp.length > 0) {
      return { isConvexId: true, tableName: tableNameProp };
    }

    // zodvex registry metadata may mark ConvexId
    const meta = registryHelpers.getMetadata(schema as any);
    if (meta?.isConvexId === true && typeof meta?.tableName === 'string') {
      return { isConvexId: true, tableName: meta.tableName };
    }

    // Check for ZodBranded (how zid is implemented)
    if (typeName === 'ZodBranded') {
      const def = (schema as any)._def;

      // Check if it has the Convex ID brand
      if (def?.brand && typeof def.brand === 'object') {
        // Check for isConvexId marker
        if ('isConvexId' in def.brand && def.brand.isConvexId === true) {
          return {
            isConvexId: true,
            tableName: def.brand.tableName || 'unknown',
          };
        }

        // Alternative: check for zod.brand pattern used by convex-helpers
        // The brand might be a symbol or have a specific structure
        const innerType = def.type;
        if (innerType && getTypeName(innerType) === 'ZodString') {
          // This is likely a branded string, could be a Convex ID
          // Check if brand has table information
          if ('tableName' in def.brand) {
            return {
              isConvexId: true,
              tableName: def.brand.tableName,
            };
          }
        }
      }
    }

    // Check for union types that might contain Convex IDs
    if (typeName === 'ZodUnion') {
      const options = (schema as z.ZodUnion<any>)._def?.options;
      if (Array.isArray(options)) {
        for (const option of options) {
          const result = detectConvexId(option);
          if (result.isConvexId) {
            return result;
          }
        }
      }
    }

    // Unwrap optional/nullable and check again
    const unwrapped = unwrapAll(schema);
    if (unwrapped !== schema) return detectConvexId(unwrapped);

    // Fallback: detect via description marker e.g., 'convexId:table'
    const desc = getDescription(schema);
    if (desc && desc.startsWith('convexId:')) {
      const tableName = desc.split(':')[1] || 'unknown';
      return { isConvexId: true, tableName };
    }
  } catch (error) {
    console.warn('Error detecting Convex ID:', error);
  }

  return { isConvexId: false };
}

/**
 * Safely get enum values from a schema
 */
export function getEnumValues(schema: z.ZodTypeAny): string[] | null {
  try {
    const typeName = getTypeName(schema);

    if (typeName === 'ZodEnum') {
      const def = (schema as any)._def;
      const values = def?.values;
      if (Array.isArray(values)) {
        return values;
      }
    }

    if (typeName === 'ZodNativeEnum') {
      const def = (schema as any)._def;
      const enumObj = def?.values;
      if (enumObj && typeof enumObj === 'object') {
        return Object.values(enumObj).filter((v) => typeof v === 'string') as string[];
      }
    }

    if (typeName === 'ZodLiteral') {
      const def = (schema as any)._def;
      const value = def?.value;
      if (value !== undefined) {
        return [String(value)];
      }
    }

    return null;
  } catch (error) {
    console.warn('Error extracting enum values:', error);
    return null;
  }
}

/**
 * Safely get array element type
 */
export function getArrayElementType(schema: z.ZodTypeAny): z.ZodTypeAny | null {
  const typeName = getTypeName(schema);
  if (typeName !== 'ZodArray') return null;

  try {
    const def = (schema as z.ZodArray<any>)._def;
    if (def && 'type' in def && isZodSchema(def.type)) {
      return def.type;
    }
  } catch (error) {
    console.warn('Error getting array element type:', error);
  }

  return null;
}

/**
 * Discriminated union helpers (safe access)
 */
export interface DiscriminatedUnionInfo {
  discriminator: string;
  options: { value: string; schema: z.ZodObject<any> }[];
}

export function getDiscriminatedUnionInfo(schema: z.ZodTypeAny): DiscriminatedUnionInfo | null {
  try {
    const typeName = getTypeName(schema);
    if (typeName !== 'ZodDiscriminatedUnion') return null;

    const def: any = (schema as any)._def;
    const discriminator: string | undefined = def?.discriminator;
    if (!discriminator) return null;

    const out: DiscriminatedUnionInfo = { discriminator, options: [] };

    // Zod can store options in a Map or an array depending on version
    const opts = def?.options;
    if (opts && typeof opts === 'object') {
      if (opts instanceof Map) {
        for (const [lit, sch] of opts.entries()) {
          if (isZodSchema(sch) && getTypeName(sch) === 'ZodObject') {
            out.options.push({ value: String(lit), schema: sch as z.ZodObject<any> });
          }
        }
      } else if (Array.isArray(opts)) {
        for (const sch of opts) {
          if (isZodSchema(sch) && getTypeName(sch) === 'ZodObject') {
            const shape = getObjectShape(sch);
            const discField = shape?.[discriminator];
            const lit = (discField as any)?._def?.value; // ZodLiteral
            if (lit !== undefined) {
              out.options.push({ value: String(lit), schema: sch as z.ZodObject<any> });
            }
          }
        }
      }
    }

    return out.options.length > 0 ? out : null;
  } catch (e) {
    console.warn('Error extracting discriminated union info', e);
    return null;
  }
}

/**
 * Extract validation rules without storing the full schema
 */
export interface ValidationRules {
  required: boolean;
  type: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  enumValues?: string[];
  nullable?: boolean;
  datetime?: boolean;
}

export function extractValidationRules(schema: z.ZodTypeAny): ValidationRules {
  const unwrapped = unwrapAll(schema);
  const typeName = getTypeName(unwrapped) || 'unknown';

  const rules: ValidationRules = {
    required: isRequired(schema),
    type: typeName.replace('Zod', '').toLowerCase(),
  };

  // Extract type-specific validation rules
  if (hasChecks(unwrapped)) {
    const checks = (unwrapped as any)._def.checks;

    for (const check of checks) {
      switch (check.kind) {
        case 'min':
          rules.min = check.value;
          break;
        case 'max':
          rules.max = check.value;
          break;
        case 'length':
          if (check.min !== undefined) rules.minLength = check.min;
          if (check.max !== undefined) rules.maxLength = check.max;
          break;
        case 'email':
          rules.email = true;
          break;
        case 'regex':
          if (check.regex?.source) {
            rules.pattern = check.regex.source;
          }
          break;
        case 'datetime':
          rules.datetime = true;
          break;
      }
    }
  }

  // Add enum values if present
  const enumValues = getEnumValues(unwrapped);
  if (enumValues) {
    rules.enumValues = enumValues;
  }

  // Nullability (presence vs. null allowed)
  const tn = getTypeName(schema);
  if (tn === 'ZodNullable') rules.nullable = true;
  if (tn === 'ZodOptional' || tn === 'ZodDefault') rules.required = false;

  return rules;
}

/**
 * Check if a schema is required (not optional/nullable)
 */
export function isRequired(schema: z.ZodTypeAny): boolean {
  const typeName = getTypeName(schema);

  if (typeName === 'ZodOptional') return false;
  if (typeName === 'ZodDefault') return false;
  // Nullable does not mean omittable; still required in presence
  if (typeName === 'ZodNullable') return true;

  // Union that includes undefined → optional
  if (typeName === 'ZodUnion') {
    const opts = (schema as any)?._def?.options;
    if (Array.isArray(opts)) {
      if (opts.some((o: any) => getTypeName(o) === 'ZodUndefined')) return false;
    }
  }

  return true;
}

/**
 * Safely get description from schema
 */
export function getDescription(schema: z.ZodTypeAny): string | null {
  try {
    const description = (schema as any)?._def?.description;
    if (typeof description === 'string') {
      return description;
    }
  } catch {
    // Ignore errors
  }

  return null;
}
