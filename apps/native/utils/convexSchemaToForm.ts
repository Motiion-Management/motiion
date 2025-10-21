import { z } from 'zod';
import {
  isZodSchema,
  getTypeName,
  unwrapOptional,
  hasEmailCheck,
  hasRegexCheck,
  getObjectShape,
  detectConvexId,
  getEnumValues,
  getArrayElementType,
  extractValidationRules,
  isRequired,
  getDescription,
  ValidationRules,
  unwrapAll,
  hasDatetimeCheck,
} from './zodSafeAccess';

/**
 * Type definitions for form field configurations
 */
export type FormFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'chips'
  | 'combobox'
  | 'relationship'
  | 'file'
  | 'object'
  | 'array';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: ValidationRules; // Changed from storing full schema
  // For nested objects/arrays
  fields?: FormFieldConfig[];
  // For relationships
  relatedTable?: string;
  // Component override
  component?: string;
  // Additional metadata
  metadata?: Record<string, any>;
}

// Configuration for recursion limits
const MAX_RECURSION_DEPTH = 10;

/**
 * Introspect a Zod schema to determine its type and properties
 * Now uses safe access utilities
 */
export function getZodType(schema: z.ZodTypeAny): string {
  if (!isZodSchema(schema)) {
    console.warn('Invalid schema passed to getZodType');
    return 'unknown';
  }

  const base = unwrapAll(schema);
  const typeName = getTypeName(base) || 'unknown';

  // Handle branded types (like zid)
  if (typeName === 'ZodBranded') {
    const convexIdInfo = detectConvexId(base);
    if (convexIdInfo.isConvexId) {
      return `convexId:${convexIdInfo.tableName || 'unknown'}`;
    }
    // Fall back to inner type for other branded types
    const innerType = (base as any)?._def?.type;
    if (isZodSchema(innerType)) {
      return getZodType(innerType);
    }
  }

  // Handle optional/nullable types
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    const unwrapped = unwrapOptional(base);
    if (unwrapped !== schema) {
      return getZodType(unwrapped);
    }
  }

  // Handle union types
  if (typeName === 'ZodUnion') {
    try {
      const options = (base as z.ZodUnion<any>)._def?.options;
      if (Array.isArray(options)) {
        // Check if one of the options is a Convex ID
        for (const option of options) {
          if (!isZodSchema(option)) continue;
          const optionType = getZodType(option);
          if (optionType.startsWith('convexId:')) {
            return optionType;
          }
        }
        // Default to first valid option
        const firstValid = options.find(isZodSchema);
        if (firstValid) {
          return getZodType(firstValid);
        }
      }
    } catch (error) {
      console.warn('Error processing ZodUnion:', error);
    }
  }

  // Handle effects (refinements, transforms)
  if (typeName === 'ZodEffects') {
    try {
      const innerSchema = (base as any)._def?.schema;
      if (isZodSchema(innerSchema)) {
        return getZodType(innerSchema);
      }
    } catch (error) {
      console.warn('Error processing ZodEffects:', error);
    }
  }

  return typeName || 'unknown';
}

/**
 * Map Zod type to form field type
 * Now with safer access patterns
 */
export function mapZodTypeToFieldType(schema: z.ZodTypeAny): FormFieldType {
  if (!isZodSchema(schema)) {
    return 'text';
  }

  const zodType = getZodType(schema);

  // Detect Convex ID via brand or description
  const convexIdInfo = detectConvexId(schema);
  if (convexIdInfo.isConvexId) {
    const tableName = convexIdInfo.tableName;
    if (tableName === '_storage') {
      return 'file';
    }
    return 'relationship';
  }

  // Handle Convex ID types
  if (zodType.startsWith('convexId:')) {
    const tableName = zodType.split(':')[1];
    if (tableName === '_storage') {
      return 'file';
    }
    return 'relationship';
  }

  // Handle arrays
  if (zodType === 'ZodArray') {
    const elementType = getArrayElementType(schema);
    if (elementType) {
      const elementZodType = getZodType(elementType);

      // Array of strings -> chips
      if (elementZodType === 'ZodString') {
        return 'chips';
      }

      // Array of objects -> nested form
      if (elementZodType === 'ZodObject') {
        return 'array';
      }

      // Array of enums -> multiselect
      const enumValues = getEnumValues(elementType);
      if (enumValues) {
        return 'multiselect';
      }
    }

    return 'array';
  }

  // Handle enums
  const enumValues = getEnumValues(schema);
  if (enumValues) {
    // Use radio for 2-3 options, select for more
    return enumValues.length <= 3 ? 'radio' : 'select';
  }

  // Handle basic types
  switch (zodType) {
    case 'ZodString':
      // Check for email validation
      if (hasEmailCheck(schema)) {
        return 'email';
      }
      // Check for date string patterns
      if (hasRegexCheck(schema, '\\d{4}-\\d{2}-\\d{2}') || hasDatetimeCheck(schema)) {
        return 'date';
      }
      return 'text';

    case 'ZodNumber':
      return 'number';

    case 'ZodBoolean':
      return 'checkbox';

    case 'ZodDate':
      return 'date';

    case 'ZodObject':
      return 'object';

    default:
      return 'text';
  }
}

/**
 * Extract field label from schema or field name
 * Fixed to properly parse metadata format
 */
export function extractLabel(fieldName: string, schema?: z.ZodTypeAny): string {
  // Check for description that might contain label
  if (schema) {
    const description = getDescription(schema);
    if (description) {
      // Fixed: properly extract label from "label:My Label|other:value" format
      const labelMatch = description.match(/label:([^|]+)/);
      if (labelMatch && labelMatch[1]) {
        return labelMatch[1].trim();
      }
    }
  }

  // Convert camelCase/snake_case to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Extract metadata from schema description
 * Improved parsing logic
 */
export function extractMetadata(schema: z.ZodTypeAny): Record<string, any> {
  const description = getDescription(schema);
  if (!description) return {};

  const metadata: Record<string, any> = {};

  try {
    // Split by pipe and parse key:value pairs
    const parts = description.split('|');

    for (const part of parts) {
      const colonIndex = part.indexOf(':');
      if (colonIndex > 0) {
        const key = part.substring(0, colonIndex).trim();
        const value = part.substring(colonIndex + 1).trim();

        if (key && value) {
          // Try to parse numbers
          if (!isNaN(Number(value))) {
            metadata[key] = Number(value);
          }
          // Try to parse booleans
          else if (value === 'true' || value === 'false') {
            metadata[key] = value === 'true';
          }
          // Keep as string
          else {
            metadata[key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error extracting metadata:', error);
  }

  return metadata;
}

/**
 * Convert a Zod object schema to form field configurations
 * Now with depth limiting and safer access
 */
export function zodObjectToFormFields(
  schema: z.ZodObject<any> | z.ZodTypeAny,
  parentName = '',
  depth = 0
): FormFieldConfig[] {
  // Prevent infinite recursion
  if (depth > MAX_RECURSION_DEPTH) {
    console.warn(`Maximum recursion depth (${MAX_RECURSION_DEPTH}) reached at path: ${parentName}`);
    return [];
  }

  if (!isZodSchema(schema)) {
    console.warn('Invalid schema passed to zodObjectToFormFields');
    return [];
  }

  // Get shape safely
  const shape = getObjectShape(schema);
  if (!shape) {
    console.warn('[zodObjectToFormFields] Could not extract shape from schema', {
      typeName: getTypeName(schema),
      instanceOfZodObject: schema instanceof z.ZodObject,
      hasShape: 'shape' in schema,
      parentName,
      depth,
    });
    return [];
  }

  console.log('[zodObjectToFormFields] Extracted shape', {
    typeName: getTypeName(schema),
    fieldCount: Object.keys(shape).length,
    fieldNames: Object.keys(shape),
    parentName,
    depth,
  });

  const fields: FormFieldConfig[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    // Skip if fieldSchema is invalid
    if (!isZodSchema(fieldSchema)) {
      console.warn(`Skipping field ${fieldName} - invalid schema`);
      continue;
    }

    const fullName = parentName ? `${parentName}.${fieldName}` : fieldName;
    const fieldType = mapZodTypeToFieldType(fieldSchema);
    const metadata = extractMetadata(fieldSchema);

    const fieldConfig: FormFieldConfig = {
      name: fullName,
      label: metadata.label || extractLabel(fieldName, fieldSchema),
      type: fieldType,
      required: isRequired(fieldSchema),
      placeholder: metadata.placeholder,
      helpText: metadata.helpText,
      validation: extractValidationRules(fieldSchema), // Store only validation rules
      metadata,
    };

    // Handle enum options
    const enumValues = getEnumValues(fieldSchema);
    if (enumValues) {
      fieldConfig.options = enumValues.map((value) => ({
        label: extractLabel(value),
        value,
      }));
    }

    // Handle relationship fields
    const convexIdInfo = detectConvexId(fieldSchema);
    if (convexIdInfo.isConvexId) {
      fieldConfig.relatedTable = convexIdInfo.tableName;
    }

    // Handle nested objects (with depth check)
    if (fieldType === 'object' && getTypeName(fieldSchema) === 'ZodObject') {
      fieldConfig.fields = zodObjectToFormFields(fieldSchema, fullName, depth + 1);
    }

    // Handle arrays of objects (with depth check)
    if (fieldType === 'array') {
      const elementType = getArrayElementType(fieldSchema);
      if (elementType && getZodType(elementType) === 'ZodObject') {
        fieldConfig.fields = zodObjectToFormFields(elementType, `${fullName}[0]`, depth + 1);
      }
    }

    fields.push(fieldConfig);
  }

  return fields;
}

/**
 * Main function to convert any Zod schema to form configuration
 * Now with comprehensive error handling
 */
export function convexSchemaToFormConfig(
  schema: z.ZodTypeAny,
  options?: {
    exclude?: string[];
    include?: string[];
    overrides?: Record<string, Partial<FormFieldConfig>>;
  }
): FormFieldConfig[] {
  try {
    if (!isZodSchema(schema)) {
      console.error('Invalid schema provided to convexSchemaToFormConfig');
      return [];
    }

    const originalTypeName = getTypeName(schema);

    // Unwrap any wrapper schemas (passthrough, branded, etc.) to get the base type
    const unwrapped = unwrapAll(schema);
    const unwrappedTypeName = getTypeName(unwrapped);

    // Debug logging to trace schema processing
    console.log('[convexSchemaToFormConfig]', {
      originalTypeName,
      unwrappedTypeName,
      hasShape: 'shape' in unwrapped,
      instanceOfZodObject: unwrapped instanceof z.ZodObject,
    });

    // Handle object schemas - check unwrapped schema
    if (unwrappedTypeName === 'ZodObject' || unwrapped instanceof z.ZodObject) {
      let fields = zodObjectToFormFields(unwrapped);

      console.log('[convexSchemaToFormConfig] Extracted fields:', {
        count: fields.length,
        fieldNames: fields.map(f => f.name),
      });

      // Apply include/exclude filters
      if (options?.include) {
        fields = fields.filter((f) => options.include!.includes(f.name));
      }
      if (options?.exclude) {
        fields = fields.filter((f) => !options.exclude!.includes(f.name));
      }

      console.log('[convexSchemaToFormConfig] After filters:', {
        count: fields.length,
        fieldNames: fields.map(f => f.name),
        include: options?.include,
        exclude: options?.exclude,
      });

      // Apply overrides
      if (options?.overrides) {
        fields = fields.map((field) => {
          const override = options.overrides![field.name];
          if (override) {
            // Merge override with existing field config
            return {
              ...field,
              ...override,
              // Preserve nested fields unless explicitly overridden
              fields: override.fields || field.fields,
              // Merge metadata
              metadata: {
                ...field.metadata,
                ...override.metadata,
              },
            };
          }
          return field;
        });
      }

      return fields;
    }

    // Handle single field schemas
    const fieldType = mapZodTypeToFieldType(schema);
    const metadata = extractMetadata(schema);

    return [
      {
        name: 'value',
        label: metadata.label || 'Value',
        type: fieldType,
        required: isRequired(schema),
        placeholder: metadata.placeholder,
        helpText: metadata.helpText,
        validation: extractValidationRules(schema),
        metadata,
      },
    ];
  } catch (error) {
    console.error('Error in convexSchemaToFormConfig:', error);
    return [];
  }
}
