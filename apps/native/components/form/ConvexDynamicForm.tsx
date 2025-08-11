import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useAppForm } from './appForm';
import { ConvexFormField } from './ConvexFormField';
import { Text } from '~/components/ui/text';
import {
  convexSchemaToFormConfig,
  FormFieldConfig,
  zodObjectToFormFields,
  extractLabel,
} from '~/utils/convexSchemaToForm';
import { getDiscriminatedUnionInfo } from '~/utils/zodSafeAccess';
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
  /**
   * When this key changes, the form re-applies initialData even if fields shape is the same.
   * Useful for reopening sheets or switching between items of the same type.
   */
  resetKey?: string | number | boolean;
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
    resetKey,
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

    // Discriminated union info
    const duInfo = useMemo(() => getDiscriminatedUnionInfo(schema as any), [schema]);

    // Track selected discriminator value (init from initialData or first option)
    const [selectedDisc, setSelectedDisc] = React.useState<string | undefined>(() => {
      if (!duInfo) return undefined;
      return (initialData as any)?.[duInfo.discriminator] ?? duInfo.options[0]?.value;
    });

    useEffect(() => {
      if (duInfo) {
        setSelectedDisc(
          (prev) => prev ?? (initialData as any)?.[duInfo.discriminator] ?? duInfo.options[0]?.value
        );
      } else {
        setSelectedDisc(undefined);
      }
    }, [duInfo?.discriminator]);

    // Convert schema (including discriminated unions) to form field configuration
    const baseFields = useMemo(() => {
      try {
        const du = duInfo;
        if (du && selectedDisc) {
          // Build discriminator field first
          const discName = du.discriminator;
          const discOptions = du.options.map((o) => ({
            label: extractLabel(o.value),
            value: o.value,
          }));
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

    // Initialize values from initialData once per fields shape or resetKey change
    const fieldsKey = useMemo(() => fields.map((f) => f.name).join('|'), [fields]);
    const initializedRef = useRef<string | null>(null);
    useEffect(() => {
      const key = `${fieldsKey}|${String(resetKey ?? '')}`;
      if (initializedRef.current === key) return;
      // Set initial values from provided initialData without recreating the form
      if (initialData && typeof initialData === 'object') {
        for (const f of fields) {
          const v = (initialData as any)[f.name];
          if (v !== undefined) {
            // @ts-ignore tanstack typed generic
            (form as any).setFieldValue(f.name as any, v);
          }
        }
      }
      initializedRef.current = key;
    }, [fieldsKey, fields, form, initialData, resetKey]);

  // Keep discriminated union branch in sync with external initialData changes (e.g., type selected outside)
  useEffect(() => {
    if (!duInfo) return;
    const discName = duInfo.discriminator as string;
    const desired = (initialData as any)?.[discName];
    if (desired && desired !== selectedDisc) {
      setSelectedDisc(desired);
      // @ts-ignore tanstack typed generic
      (form as any).setFieldValue(discName as any, desired);
    }
  }, [initialData, duInfo, selectedDisc, form]);

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

    // Filter fields by groups and conditional showWhen if specified
    const filteredFields = useMemo(() => {
      const byGroup = !groups || groups.length === 0
        ? fields
        : fields.filter((field) => {
            const fieldGroups = field.metadata?.group;
            if (!fieldGroups) return false;
            const fieldGroupArray = Array.isArray(fieldGroups) ? fieldGroups : [fieldGroups];
            return fieldGroupArray.some((g) => groups.includes(g));
          });

      // Apply conditional visibility using current form values
      return byGroup.filter((field) => {
        const cond = field.metadata?.showWhen;
        if (!cond) return true;
        const current = (values as any)?.[cond.field];
        if (cond.equals !== undefined) {
          if (Array.isArray(cond.equals)) {
            return cond.equals.includes(current);
          }
          return current === cond.equals;
        }
        if (cond.in && Array.isArray(cond.in)) {
          return cond.in.includes(current);
        }
        return true;
      });
    }, [fields, groups, values]);

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
