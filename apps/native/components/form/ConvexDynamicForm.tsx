import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useAppForm } from './appForm';
import { ConvexFormField } from './ConvexFormField';
import { Text } from '~/components/ui/text';
import { convexSchemaToFormConfig, FormFieldConfig, zodObjectToFormFields, extractLabel } from '~/utils/convexSchemaToForm';
import { getDiscriminatedUnionInfo, getTypeName } from '~/utils/zodSafeAccess';
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

    // Discriminated union info
    const duInfo = useMemo(() => getDiscriminatedUnionInfo(schema as any), [schema]);

    // Track selected discriminator value (init from initialData or first option)
    const [selectedDisc, setSelectedDisc] = React.useState<string | undefined>(() => {
      if (!duInfo) return undefined;
      return (initialData as any)?.[duInfo.discriminator] ?? duInfo.options[0]?.value;
    });

    useEffect(() => {
      if (duInfo) {
        setSelectedDisc((prev) => (prev ?? (initialData as any)?.[duInfo.discriminator] ?? duInfo.options[0]?.value));
      } else {
        setSelectedDisc(undefined);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duInfo?.discriminator]);

    // Convert schema (including discriminated unions) to form field configuration
    const baseFields = useMemo(() => {
      try {
        const du = duInfo;
        if (du && selectedDisc) {
          // Build discriminator field first
          const discName = du.discriminator;
          const discOptions = du.options.map((o) => ({ label: extractLabel(o.value), value: o.value }));
          const discField: FormFieldConfig = {
            name: discName,
            label: extractLabel(discName),
            type: discOptions.length <= 3 ? 'radio' : 'select',
            required: true,
            options: discOptions,
            metadata: {},
          };

          // Determine active branch via selectedDisc
          const active = du.options.find((o) => o.value === selectedDisc) ?? du.options[0];
          const branchFields = active ? zodObjectToFormFields(active.schema as any) : [];
          const filteredBranch = branchFields.filter((f) => f.name !== discName);

          let fields: FormFieldConfig[] = [discField, ...filteredBranch];
          if (include) fields = fields.filter((f) => include.includes(f.name));
          if (exclude) fields = fields.filter((f) => !exclude.includes(f.name));
          if (overrides) {
            fields = fields.map((f) => ({
              ...f,
              ...overrides[f.name],
              metadata: { ...f.metadata, ...(overrides[f.name]?.metadata || {}) },
              fields: overrides[f.name]?.fields || f.fields,
            }));
          }
          return fields;
        }

        return convexSchemaToFormConfig(schema, {
          exclude,
          include,
          overrides,
        });
      } catch (error) {
        console.error('Error converting schema to form config:', error);
        return [];
      }
    }, [schema, exclude, include, overrides, duInfo, selectedDisc]);

    // Enhance fields with metadata
    const fields = useMemo(() => {
      return enhanceFieldsWithMetadata(baseFields, metadata);
    }, [baseFields, metadata]);

    // Build default values from schema and initial data
    const defaultValues = useMemo(() => {
      const values: Record<string, any> = {};
      fields.forEach((field) => {
        // Option-driven defaults: select/radio/picker default to first option
        if (
          (field.type === 'select' || field.type === 'radio' || field.component === 'picker') &&
          field.options &&
          field.options.length > 0
        ) {
          values[field.name] = field.options[0].value;
          return;
        }
        switch (field.type) {
          case 'checkbox':
            values[field.name] = false;
            break;
          case 'chips':
          case 'multiselect':
            values[field.name] = [];
            break;
          case 'number':
            values[field.name] = field.metadata?.min ?? undefined;
            break;
          case 'object':
            values[field.name] = {};
            break;
          default:
            values[field.name] = '';
        }
      });
      return values;
    }, [fields]);

    // Create form instance
    const form = useAppForm({
      defaultValues,
      validators: {
        onChange: zodValidator(schema as any),
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

    // Initialize values from initialData once per fields shape change
    const fieldsKey = useMemo(() => fields.map((f) => f.name).join('|'), [fields]);
    const initializedRef = useRef<string | null>(null);
    useEffect(() => {
      if (initializedRef.current === fieldsKey) return;
      // Set initial values from provided initialData without recreating the form
      if (initialData && typeof initialData === 'object') {
        for (const f of fields) {
          const v = (initialData as any)[f.name];
          if (v !== undefined) {
            // @ts-expect-error tanstack typed generic
            form.store.setFieldValue(f.name as any, v);
          }
        }
      }
      initializedRef.current = fieldsKey;
    }, [fieldsKey, fields, form.store, initialData]);

    // Observe values changes with useStore and debounce external onChange
    const values = useStore(form.store, (state) => state.values);
    // Recompute fields on discriminator change (discriminated unions)
    useEffect(() => {
      if (!duInfo) return;
      const v = (values as any)[duInfo.discriminator];
      if (v && v !== selectedDisc) setSelectedDisc(v);
    }, [values, duInfo, selectedDisc]);
    useEffect(() => {
      if (!onChange) return;
      debouncedOnChange(values);
      return () => {
        debouncedOnChange.cancel();
      };
    }, [values, debouncedOnChange, onChange]);

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
