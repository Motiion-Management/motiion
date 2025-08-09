import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useCallback, useRef, useState, useEffect } from 'react';
import { debounce } from '~/lib/utils';

export interface AutoSaveConfig {
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  fieldMapping?: Record;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  dirtyFields: Set;
}

/**
 * Hook for auto-saving form data to Convex
 * Provides debounced save functionality with optimistic updates
 */
export function useAutoSaveForm(config: AutoSaveConfig = {}) {
  const { debounceMs = 1000, onSaveStart, onSaveSuccess, onSaveError, fieldMapping = {} } = config;

  const updateUser = useMutation(api.users.updateMyUser);
  const patchUserAttributes = useMutation(api.users.patchUserAttributes);
  const [saveState, setSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    dirtyFields: new Set(),
  });

  const pendingSaves = useRef<Record>({});
  const saveTimeoutRef = useRef<ReturnType | null>(null);

  // Debounced save function
  const performSave = useCallback(async () => {
    const fieldsToSave = { ...pendingSaves.current };
    pendingSaves.current = {};

    if (Object.keys(fieldsToSave).length === 0) return;

    setSaveState((prev) => ({ ...prev, isSaving: true, error: null }));
    onSaveStart?.();

    try {
      // Transform flat fields into nested structure for Convex
      const updatePayload: Record = {};

      Object.entries(fieldsToSave).forEach(([key, value]) => {
        if (fieldMapping[key]) {
          // Handle nested field mapping like 'attributes.hairColor'
          const path = fieldMapping[key].split('.');
          let current = updatePayload;

          for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
              current[path[i]] = {};
            }
            current = current[path[i]];
          }

          current[path[path.length - 1]] = value;
        } else {
          // Direct field mapping
          updatePayload[key] = value;
        }
      });

      // If attributes are present, merge them server-side via patchUserAttributes
      if (updatePayload.attributes && typeof updatePayload.attributes === 'object') {
        const { attributes, ...rest } = updatePayload as any;
        await patchUserAttributes({ attributes });
        if (Object.keys(rest).length > 0) {
          await updateUser(rest);
        }
      } else {
        await updateUser(updatePayload);
      }

      setSaveState((prev) => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        dirtyFields: new Set(),
      }));
      onSaveSuccess?.();
    } catch (error) {
      const err = error as Error;
      setSaveState((prev) => ({
        ...prev,
        isSaving: false,
        error: err,
      }));
      onSaveError?.(err);
    }
  }, [updateUser, patchUserAttributes, fieldMapping, onSaveStart, onSaveSuccess, onSaveError]);

  // Debounced save trigger
  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
  }, [performSave, debounceMs]);

  // Save a single field
  const saveField = useCallback(
    (fieldName: string, value: any) => {
      pendingSaves.current[fieldName] = value;
      setSaveState((prev) => ({
        ...prev,
        dirtyFields: new Set([...prev.dirtyFields, fieldName]),
      }));
      triggerSave();
    },
    [triggerSave]
  );

  // Save multiple fields at once
  const saveFields = useCallback(
    (fields: Record) => {
      Object.assign(pendingSaves.current, fields);
      setSaveState((prev) => ({
        ...prev,
        dirtyFields: new Set([...prev.dirtyFields, ...Object.keys(fields)]),
      }));
      triggerSave();
    },
    [triggerSave]
  );

  // Force immediate save of pending changes
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await performSave();
  }, [performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveField,
    saveFields,
    saveNow,
    saveState,
    isAutoSaving: saveState.isSaving,
    hasPendingChanges: pendingSaves.current && Object.keys(pendingSaves.current).length > 0,
  };
}

/**
 * Hook that integrates auto-save with TanStack Form
 */
export function useAutoSaveFormField<T = any>(
  fieldName: string,
  getValue: () => T,
  autoSaveConfig?: AutoSaveConfig
) {
  const { saveField } = useAutoSaveForm(autoSaveConfig);
  const previousValue = useRef<T>(getValue());

  useEffect(() => {
    const currentValue = getValue();
    if (currentValue !== previousValue.current) {
      previousValue.current = currentValue;
      saveField(fieldName, currentValue);
    }
  }, [getValue, fieldName, saveField]);
}
