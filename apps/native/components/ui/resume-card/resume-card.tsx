import type { ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View, type ViewProps, TouchableOpacity } from 'react-native';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import MoreVertical from '~/lib/icons/MoreVertical';

export interface ResumeCardItem {
  id: string;
  title: string;
  opacity?: number;
}

interface ResumeCardProps extends ViewProps {
  label: string;
  title: string;
  items: ResumeCardItem[];
  actionLabel: string;
  onActionPress?: () => void;
  onItemPress?: (item: ResumeCardItem) => void;
}

export const ResumeCard = React.forwardRef<ViewRef, ResumeCardProps>(
  ({ className, label, title, items, actionLabel, onActionPress, onItemPress, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          'rounded-lg border border-border-default bg-surface-high p-6 shadow-sm',
          className
        )}
        {...props}>
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-text-accent mb-0.5 text-xs font-medium uppercase tracking-wider">
              {label}
            </Text>
            <Text className="text-base font-semibold text-text-high">{title}</Text>
          </View>

          {/* Three dots menu */}
          <View className="h-6 w-6 items-center justify-center">
            <MoreVertical className="h-4 w-4 color-text-low" />
          </View>
        </View>

        {/* Items list */}
        <View className="mb-4 space-y-1">
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onItemPress?.(item)}
              className="flex-row items-center space-x-2 py-1"
              style={{ opacity: item.opacity ?? 1 }}>
              <View className="h-2.5 w-2.5 rounded-sm bg-border-low" />
              <Text className="flex-1 text-xs text-text-high">{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action button */}
        <Button
          variant="primary"
          className="w-full rounded-3xl bg-surface-default py-2 shadow-sm"
          onPress={onActionPress}>
          <Text className="text-xs font-semibold text-white">{actionLabel}</Text>
        </Button>
      </View>
    );
  }
);

ResumeCard.displayName = 'ResumeCard';
