import { useAppForm } from '~/components/form/appForm';
import { useAutoSaveForm, AutoSaveConfig } from './useAutoSaveForm';
import { useEffect, useRef } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useUser } from './useUser';

type UseAppFormOptions = Parameters<typeof useAppForm>[0];

interface AutoSaveAppFormOptions<T> extends UseAppFormOptions {
  autoSave?: boolean | AutoSaveConfig;
  saveDebounceMs?: number;
  showSaveIndicators?: boolean;
  fieldMapping?: Record<string, string>;
}

/**
 * Enhanced version of useAppForm with auto-save functionality
 * Automatically saves form data to Convex as users type
 */
export function useAutoSaveAppForm<T extends Record<string, any>>(
  options: AutoSaveAppFormOptions<T>
) {
  const {
    autoSave = true,
    saveDebounceMs = 1000,
    showSaveIndicators = true,
    fieldMapping = {},
    defaultValues,
    ...formOptions
  } = options;

  // Get current user data for initial values
  const { user } = useUser();

  // Merge user data with provided default values
  const mergedDefaultValues = {
    ...(defaultValues || {}),
    ...(user ? extractFormValues(user, Object.keys(defaultValues || {})) : {}),
  } as T;

  // Create the base form
  const form = useAppForm({
    defaultValues: mergedDefaultValues,
    ...formOptions,
  } as any);

  // Setup auto-save if enabled
  const autoSaveConfig =
    typeof autoSave === 'object' ? autoSave : autoSave ? { debounceMs: saveDebounceMs } : undefined;

  const { saveFields, saveState, isAutoSaving } = useAutoSaveForm(
    autoSaveConfig
      ? {
          ...autoSaveConfig,
          fieldMapping,
          onSaveStart: () => {
            // Transform fields for nested updates
            // e.g., hairColor -> attributes: { hairColor: value }
          },
        }
      : {
          fieldMapping,
          onSaveStart: () => {
            // Transform fields for nested updates
            // e.g., hairColor -> attributes: { hairColor: value }
          },
        }
  );

  // Track previous form values
  const previousValues = useRef<T>(form.state.values as T);

  // Auto-save when form values change
  useEffect(() => {
    if (!autoSave) return;

    const currentValues = form.state.values as T;
    const changedFields: Record<string, any> = {};

    // Find changed fields
    Object.keys(currentValues).forEach((key) => {
      if (currentValues[key as keyof T] !== previousValues.current[key as keyof T]) {
        changedFields[key] = currentValues[key as keyof T];
      }
    });

    if (Object.keys(changedFields).length > 0) {
      saveFields(changedFields);
      previousValues.current = currentValues;
    }
  }, [form.state.values, autoSave, saveFields]);

  // Enhanced form object with auto-save state
  const enhancedForm = Object.assign({}, form, {
    autoSave: {
      isEnabled: !!autoSave,
      isSaving: isAutoSaving,
      saveState,
      showIndicators: showSaveIndicators,
    },
  });

  return enhancedForm;
}

/**
 * Extract form-relevant values from user object
 * Maps nested attributes to flat form fields
 */
function extractFormValues(user: any, fieldNames: string[]): Record<string, any> {
  const values: Record<string, any> = {};

  fieldNames.forEach((fieldName) => {
    // Check top-level fields
    if (user[fieldName] !== undefined) {
      values[fieldName] = user[fieldName];
    }
    // Check attributes object
    else if (user.attributes?.[fieldName] !== undefined) {
      values[fieldName] = user.attributes[fieldName];
    }
    // Check sizing object
    else if (user.sizing?.[fieldName] !== undefined) {
      values[fieldName] = user.sizing[fieldName];
    }
  });

  return values;
}
