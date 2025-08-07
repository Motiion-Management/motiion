import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useCallback } from 'react';
import { View } from 'react-native';

import { useSheetState } from '~/components/ui/sheet';
import { SizingCard } from '~/components/ui/sizing-card';
import { SizingPickerSheet } from '~/components/ui/sizing-picker-sheet';
import { cn } from '~/lib/cn';
import { SizingMetricConfig } from '~/types/sizing';

interface SizingMetricProps {
  metric: SizingMetricConfig;
  className?: string;
}

export function SizingMetric({ metric, className }: SizingMetricProps) {
  const user = useQuery(api.users.getMyUser);
  const { isOpen, open, close } = useSheetState();

  // Get current value from user data
  const currentValue =
    user?.sizing?.[metric.section]?.[
      metric.field as keyof (typeof user.sizing)[typeof metric.section]
    ];

  const handleCardPress = () => {
    console.log('Opening sizing picker for:', metric.field);
    open();
  };

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
      <View className={cn('w-[118px]', className)}>
        <SizingCard
          label={metric.label}
          value={currentValue}
          unit={metric.unit}
          onPress={handleCardPress}
        />
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
