import { api } from '@packages/backend/convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

import { useSheetState } from '~/components/ui/sheet';
import { SizingCard } from '~/components/ui/sizing-card';
import { SizingPickerSheet } from '~/components/ui/sizing-picker-sheet';
import { AutoSaveIndicator } from '~/components/form/AutoSaveIndicator';
import { useAutoSaveForm } from '~/hooks/useAutoSaveForm';
import { cn } from '~/lib/cn';
import { SizingMetricConfig } from '~/types/sizing';

interface SizingMetricProps {
  metric: SizingMetricConfig;
  className?: string;
  showAutoSaveIndicator?: boolean;
}

export function SizingMetricAutoSave({
  metric,
  className,
  showAutoSaveIndicator = true,
}: SizingMetricProps) {
  const user = useQuery(api.users.getMyUser);
  const updateSizing = useMutation(api.users.updateMySizingField);
  const { isOpen, open, close } = useSheetState();

  // Setup auto-save for this specific field
  const { saveField, saveState } = useAutoSaveForm({
    debounceMs: 500, // Save 500ms after value changes
    fieldMapping: {
      [metric.field]: `sizing.${metric.section}.${metric.field}`,
    },
  });

  // Get current value from user data
  const currentValue =
    user?.sizing?.[metric.section]?.[
      metric.field as keyof (typeof user.sizing)[typeof metric.section]
    ];

  const handleCardPress = () => {
    open();
  };

  const handleValueChange = useCallback(
    async (value: number | string | null) => {
      // Auto-save the value
      try {
        await updateSizing({
          section: metric.section,
          field: metric.field,
          value: value as string,
        });

        // Notify auto-save system that save completed
        saveField(metric.field, value);
      } catch (error) {
        console.error('Failed to save sizing field:', error);
      }
    },
    [metric.section, metric.field, updateSizing, saveField]
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        close();
      }
    },
    [close]
  );

  return (
    <>
      <View className={cn('relative w-[118px]', className)}>
        <SizingCard
          label={metric.label}
          value={currentValue}
          unit={metric.unit}
          onPress={handleCardPress}
        />

        {/* Auto-save indicator */}
        {showAutoSaveIndicator && (
          <AutoSaveIndicator saveState={saveState} position="bottom-right" size="sm" />
        )}
      </View>

      <SizingPickerSheet
        metric={metric}
        initialValue={currentValue}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
