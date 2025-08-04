import React, { useEffect } from 'react';
import { View } from 'react-native';
import { CheckCircle2, Loader2 } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { useAutoSaveForm, AutoSaveConfig } from '~/hooks/useAutoSaveForm';
import { cn } from '~/lib/utils';

interface AutoSaveFormFieldProps {
  children: React.ReactElement;
  fieldName: string;
  value: any;
  onValueChange?: (value: any) => void;
  autoSaveConfig?: AutoSaveConfig;
  showSaveIndicator?: boolean;
  className?: string;
}

/**
 * Wrapper component that adds auto-save functionality to form fields
 * Shows visual feedback for save states
 */
export function AutoSaveFormField({
  children,
  fieldName,
  value,
  onValueChange,
  autoSaveConfig,
  showSaveIndicator = true,
  className,
}: AutoSaveFormFieldProps) {
  const { saveField, saveState } = useAutoSaveForm(autoSaveConfig);

  // Auto-save when value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      saveField(fieldName, value);
    }
  }, [value, fieldName, saveField]);

  // Handle value changes if callback provided
  const handleValueChange = (newValue: any) => {
    onValueChange?.(newValue);
  };

  return (
    <View className={cn('relative', className)}>
      {/* Render the form field */}
      {React.cloneElement(children, {
        value,
        onValueChange: handleValueChange,
      })}

      {/* Save state indicator */}
      {showSaveIndicator && (
        <View className="absolute right-0 top-0 flex-row items-center gap-1">
          {saveState.isSaving && (
            <>
              <Loader2 size={14} className="animate-spin text-text-low" />
              <Text variant="footnote" className="text-text-low">
                Saving...
              </Text>
            </>
          )}

          {!saveState.isSaving &&
            saveState.lastSaved &&
            saveState.dirtyFields.has(fieldName) === false && (
              <>
                <CheckCircle2 size={14} className="text-accent" />
                <Text variant="footnote" className="text-accent">
                  Saved
                </Text>
              </>
            )}

          {saveState.error && (
            <Text variant="footnote" className="text-destructive">
              Failed to save
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Hook to integrate auto-save with existing form components
 * Use this when you can't wrap the component
 */
export function useAutoSaveField(fieldName: string, value: any, autoSaveConfig?: AutoSaveConfig) {
  const { saveField, saveState } = useAutoSaveForm(autoSaveConfig);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      saveField(fieldName, value);
    }
  }, [value, fieldName, saveField]);

  return {
    isSaving: saveState.isSaving,
    lastSaved: saveState.lastSaved,
    error: saveState.error,
    isDirty: saveState.dirtyFields.has(fieldName),
  };
}
