import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { ConvexFormField } from './ConvexFormField';
import { Text } from '~/components/ui/text';
import {
  convexSchemaToFormConfig,
  FormFieldConfig,
  zodObjectToFormFields,
  extractLabel,
} from '~/utils/convexSchemaToForm';
import { getDiscriminatedUnionInfo } from '~/utils/zodSafeAccess';
import { enhanceFieldsWithMetadata, type FormMetadata } from '~/utils/convexFormMetadata';
import { debounce } from '~/lib/debounce';

interface ConvexDynamicFormProps {
  schema: z.ZodObject<any> | z.ZodTypeAny;
  metadata?: FormMetadata;
  initialData?: Record<string, any>;
  onChange?: (data: Record<string, any>) => void;
  // Required external TanStack form instance to share state across multiple render trees
  form: any;
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
    form,
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

    // Sync initialData to form when it changes
    // This ensures form fields get populated with the correct values
    const lastInitialDataRef = useRef<string>('');
    useEffect(() => {
      if (!form || !initialData) return;

      // Create a signature of the initial data to detect changes
      const dataSignature = JSON.stringify(initialData);
      if (dataSignature === lastInitialDataRef.current) return;

      // Update form values with initial data
      for (const [key, value] of Object.entries(initialData)) {
        const currentValue = (form as any).state?.values?.[key];
        // Only update if value is different to avoid unnecessary re-renders
        if (value !== undefined && value !== currentValue) {
          (form as any).setFieldValue?.(key, value);
        }
      }

      lastInitialDataRef.current = dataSignature;
    }, [initialData, form]);

    // Discriminated union info
    const duInfo = useMemo(() => getDiscriminatedUnionInfo(schema), [schema]);

    // Track selected discriminator value (init from initialData or first option)
    const [selectedDisc, setSelectedDisc] = React.useState<string | undefined>(() => {
      if (!duInfo || !duInfo.options || !Array.isArray(duInfo.options)) return undefined;
      return (initialData as any)?.[duInfo.discriminator] ?? duInfo.options[0]?.value;
    });

    useEffect(() => {
      if (duInfo && duInfo.options && Array.isArray(duInfo.options)) {
        setSelectedDisc(
          (prev) => prev ?? (initialData as any)?.[duInfo.discriminator] ?? duInfo.options[0]?.value
        );
      } else {
        setSelectedDisc(undefined);
      }
    }, [duInfo?.discriminator, initialData]);

    // Convert schema (including discriminated unions) to form field configuration
    const baseFields = useMemo(() => {
      try {
        const du = duInfo;
        if (du && selectedDisc && du.options && Array.isArray(du.options)) {
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
          const branchFields = active ? zodObjectToFormFields(active.schema) : [];
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

    // Observe values changes with useStore and debounce external onChange
    const values = useStore((form as any).store, (state: any) => state.values);

    // Update selected discriminator when form values change
    useEffect(() => {
      if (!duInfo) return;
      const v = (values as any)?.[duInfo.discriminator];
      if (v && v !== selectedDisc) setSelectedDisc(v);
    }, [values, duInfo, selectedDisc]);

    // Trigger onChange callback when values change
    useEffect(() => {
      if (!onChange) return;
      debouncedOnChange(values);
      return () => {
        debouncedOnChange.cancel();
      };
    }, [values, debouncedOnChange, onChange]);

    // Filter fields by groups and conditional showWhen if specified
    const filteredFields = useMemo(() => {
      const byGroup =
        !groups || groups.length === 0
          ? fields
          : fields.filter((field) => {
              const fieldGroups = field.metadata?.group;
              if (!fieldGroups) return false;
              const fieldGroupArray = Array.isArray(fieldGroups) ? fieldGroups : [fieldGroups];
              return fieldGroupArray.some((g) => groups.includes(g));
            });

      // Apply conditional visibility using current form values
      const visible = byGroup.filter((field) => {
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

      // Apply conditional disabling via metadata.disabledWhen and conditional label via labelWhen
      return visible.map((field) => {
        const disabledWhen = (field.metadata as any)?.disabledWhen;
        const labelWhen = (field.metadata as any)?.labelWhen;
        let shouldDisable = false;
        if (disabledWhen) {
          const current = (values as any)?.[disabledWhen.field];
          if (disabledWhen.isEmpty) {
            shouldDisable = current == null || current === '';
          } else if (disabledWhen.equals !== undefined) {
            if (Array.isArray(disabledWhen.equals)) {
              shouldDisable = !disabledWhen.equals.includes(current);
            } else {
              shouldDisable = current !== disabledWhen.equals;
            }
          }
        }

        const labelOverridden = (() => {
          if (!labelWhen) return undefined;
          const tryRule = (rule: any) => {
            const labelCurrent = (values as any)?.[rule.field];
            if (rule.equals !== undefined) {
              if (Array.isArray(rule.equals)) {
                if (rule.equals.includes(labelCurrent)) return rule.label;
              } else if (labelCurrent === rule.equals) {
                return rule.label;
              }
            }
            return undefined;
          };
          if (Array.isArray(labelWhen)) {
            for (const r of labelWhen) {
              const m = tryRule(r);
              if (m) return m;
            }
            return undefined;
          }
          return tryRule(labelWhen);
        })();

        return {
          ...field,
          metadata: {
            ...(field.metadata as any),
            disabled: shouldDisable ? true : field.metadata?.disabled,
          },
          label: labelOverridden ?? field.label,
        };
      });
    }, [fields, groups, values]);

    // Ensure endDate is not before startDate and default endDate to startDate when empty
    useEffect(() => {
      const names = filteredFields.map((f) => f.name);
      if (!names.includes('startDate') || !names.includes('endDate')) return;

      const sd = (values as any)?.startDate;
      const ed = (values as any)?.endDate;
      if (!sd) return;

      // Normalize start/end as Date objects for comparison
      const parseToDate = (v: any): Date | undefined => {
        if (!v) return undefined;
        if (v instanceof Date) return v;
        if (typeof v === 'string') {
          // Support 'yyyy-MM-dd' by constructing a local Date
          const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (m) {
            const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
            return isNaN(d.getTime()) ? undefined : d;
          }
          const d = new Date(v);
          return isNaN(d.getTime()) ? undefined : d;
        }
        return undefined;
      };

      const sdDate = parseToDate(sd);
      if (!sdDate) return;

      const setEnd = (date: Date) => {
        // Always store Date objects in the form layer
        (form as any).setFieldValue('endDate', date);
      };

      if (!ed) {
        setEnd(sdDate);
        return;
      }

      const edDate = parseToDate(ed);
      if (!edDate || edDate < sdDate) {
        setEnd(sdDate);
      }
    }, [filteredFields, values, form]);

    // Sort fields by order if specified
    const sortedFields = useMemo(() => {
      return [...filteredFields].sort((a, b) => {
        const orderA = (a.metadata as any)?.order ?? Infinity;
        const orderB = (b.metadata as any)?.order ?? Infinity;
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
            const w = (f.metadata as any)?.width;
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
      <View className="gap-8">
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
