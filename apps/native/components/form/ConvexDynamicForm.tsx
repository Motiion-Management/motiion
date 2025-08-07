import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View } from 'react-native';
import { useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { useAppForm } from './appForm';
import { ConvexFormField } from './ConvexFormField';
import { Text } from '~/components/ui/text';
import { convexSchemaToFormConfig, FormFieldConfig } from '~/utils/convexSchemaToForm';
import { enhanceFieldsWithMetadata, FormMetadata } from '~/utils/convexFormMetadata';
import { debounce } from '~/lib/debounce';

interface ConvexDynamicFormProps {
  schema: z.ZodObject<any> | z.ZodTypeAny;
  metadata?: FormMetadata;
  initialData?: Record<string, any>;
  onChange?: (data: Record<string, any>) => void;
  onSubmit?: (data: Record<string, any>) => void;
  exclude?: string[];
  include?: string[];
  overrides?: Record<string, Partial<FormFieldConfig>>;
  debounceMs?: number;
  groups?: string[]; // Filter fields by group
}

/**
 * Dynamic form component that generates fields from Convex Zod schemas
 */
export const ConvexDynamicForm = React.memo(
  ({
    schema,
    metadata = {},
    initialData = {},
    onChange,
    onSubmit,
    exclude,
    include,
    overrides,
    debounceMs = 300,
    groups,
  }: ConvexDynamicFormProps) => {
    // Safety check for undefined schema
    if (!schema) {
      console.error('ConvexDynamicForm: schema is undefined');
      return (
        <View className="rounded-lg bg-destructive/10 p-4">
          <Text className="text-destructive">Error: Form schema is undefined</Text>
          <Text className="mt-2 text-sm text-text-disabled">
            The form cannot be rendered without a valid schema.
          </Text>
        </View>
      );
    }

    // Check if schema has _def property
    // if (!schema._def) {
    //   console.error('ConvexDynamicForm: schema._def is undefined', schema);
    //   return (
    //     <View className="rounded-lg bg-destructive/10 p-4">
    //       <Text className="text-destructive">Error: Invalid schema format</Text>
    //       <Text className="mt-2 text-sm text-text-disabled">
    //         The provided schema is not a valid Zod schema.
    //       </Text>
    //     </View>
    //   );
    // }

    // Convert schema to form field configuration
    const baseFields = useMemo(() => {
      try {
        return convexSchemaToFormConfig(schema, {
          exclude,
          include,
          overrides,
        });
      } catch (error) {
        console.error('Error converting schema to form config:', error);
        return [];
      }
    }, [schema, exclude, include, overrides]);

    // Enhance fields with metadata
    const fields = useMemo(() => {
      return enhanceFieldsWithMetadata(baseFields, metadata);
    }, [baseFields, metadata]);

    // Build default values from schema and initial data
    const defaultValues = useMemo(() => {
      const values: Record<string, any> = {};

      fields.forEach((field) => {
        const fieldName = field.name;

        // Use initial data if available
        if (initialData[fieldName] !== undefined) {
          values[fieldName] = initialData[fieldName];
        }
        // Set defaults based on field type
        else {
          switch (field.type) {
            case 'checkbox':
              values[fieldName] = false;
              break;
            case 'chips':
            case 'multiselect':
              values[fieldName] = [];
              break;
            case 'number':
              values[fieldName] = field.metadata?.min || 0;
              break;
            case 'object':
              values[fieldName] = {};
              break;
            default:
              values[fieldName] = '';
          }
        }
      });

      return values;
    }, [fields, initialData]);

    // Create form instance
    const form = useAppForm({
      defaultValues,
      validators: {
        onChange: schema as any,
      },
      onSubmit: async ({ value }) => {
        if (onSubmit) {
          onSubmit(value);
        }
      },
    });

    // Use ref to store the latest onChange callback without causing re-renders
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Create stable debounced onChange handler
    const debouncedOnChange = useMemo(() => {
      const handler = debounce((values: Record<string, any>) => {
        if (onChangeRef.current) {
          onChangeRef.current(values);
        }
      }, debounceMs);

      return handler;
    }, [debounceMs]);

    // Subscribe to form state changes with a selector to prevent unnecessary re-renders
    useEffect(() => {
      if (!onChange) return;

      // Subscribe directly to the store to avoid re-renders
      const unsubscribe = form.store.subscribe((state) => {
        debouncedOnChange(state.values);
      });

      return () => {
        unsubscribe();
        debouncedOnChange.cancel();
      };
    }, [form.store, debouncedOnChange, onChange]);

    // Filter fields by groups if specified
    const filteredFields = useMemo(() => {
      if (!groups || groups.length === 0) return fields;

      return fields.filter((field) => {
        const fieldGroups = field.metadata?.group;
        if (!fieldGroups) return false;

        const fieldGroupArray = Array.isArray(fieldGroups) ? fieldGroups : [fieldGroups];
        return fieldGroupArray.some((g) => groups.includes(g));
      });
    }, [fields, groups]);

    // Sort fields by order if specified
    const sortedFields = useMemo(() => {
      return [...filteredFields].sort((a, b) => {
        const orderA = a.metadata?.order ?? Infinity;
        const orderB = b.metadata?.order ?? Infinity;
        return orderA - orderB;
      });
    }, [filteredFields]);

    // Group consecutive half/third width fields into rows
    const rowGroupedFields = useMemo(() => {
      const rows: FormFieldConfig[][] = [];
      let currentRow: FormFieldConfig[] = [];

      sortedFields.forEach((field, index) => {
        const width = field.metadata?.width || 'full';

        if (width === 'full') {
          if (currentRow.length > 0) {
            rows.push(currentRow);
            currentRow = [];
          }
          rows.push([field]);
        } else {
          currentRow.push(field);

          // Check if row is complete
          const totalWidth = currentRow.reduce((sum, f) => {
            const w = f.metadata?.width;
            return sum + (w === 'half' ? 0.5 : w === 'third' ? 0.33 : 1);
          }, 0);

          if (totalWidth >= 0.99 || index === sortedFields.length - 1) {
            rows.push(currentRow);
            currentRow = [];
          }
        }
      });

      // Add any remaining fields
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }

      return rows;
    }, [sortedFields]);

    return (
      <View className="gap-4">
        {rowGroupedFields.map((row, rowIndex) => (
          <View key={rowIndex} className={row.length > 1 ? 'flex-row gap-2' : ''}>
            {row.map((field) => (
              <ConvexFormField key={field.name} field={field} form={form} />
            ))}
          </View>
        ))}
      </View>
    );
  }
);

/**
 * Hook to use dynamic form with Convex schemas
 */
// export function useConvexDynamicForm({
//   schema,
//   initialData = {},
//   validators = {},
//   onSubmit
// }: {
//   schema: z.ZodObject<any>
//   initialData?: Record<string, any>
//   validators?: any
//   onSubmit?: (data: Record<string, any>) => void
// }) {
//   // Build default values from schema
//   const defaultValues = useMemo(() => {
//     const shape = schema._def.shape()
//     const values: Record<string, any> = {}
//
//     Object.keys(shape).forEach(key => {
//       values[key] = initialData[key] !== undefined
//         ? initialData[key]
//         : getDefaultValue(shape[key])
//     })
//
//     return values
//   }, [schema, initialData])
//
//   return useAppForm({
//     defaultValues,
//     validators: {
//       onChange: schema as any,
//       ...validators
//     },
//     onSubmit: async ({ value }) => {
//       if (onSubmit) {
//         onSubmit(value)
//       }
//     }
//   })
// }
//
// /**
//  * Get default value for a Zod schema type
//  */
// function getDefaultValue(schema: z.ZodTypeAny): any {
//   const typeName = schema._def.typeName
//
//   // Handle optional types
//   if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
//     return undefined
//   }
//
//   // Handle default values
//   if (typeName === 'ZodDefault') {
//     return (schema as z.ZodDefault<any>)._def.defaultValue()
//   }
//
//   // Handle basic types
//   switch (typeName) {
//     case 'ZodString':
//       return ''
//     case 'ZodNumber':
//       return 0
//     case 'ZodBoolean':
//       return false
//     case 'ZodArray':
//       return []
//     case 'ZodObject':
//       return {}
//     default:
//       return undefined
//   }
// }
