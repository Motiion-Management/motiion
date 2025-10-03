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
          'rounded-lg border border-border-low bg-surface-default p-6 shadow-sm',
          className
        )}
        {...props}>
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1 gap-1">
            <Text variant="labelXs" className="text-accent">
              {label}
            </Text>
            <Text variant="header5">{title}</Text>
          </View>

          {/* Three dots menu */}
          <View className="h-6 w-6 items-center justify-center">
            <MoreVertical className="h-4 w-4 text-text-low" />
          </View>
        </View>

        {/* Items list */}
        <View className="mb-4 gap-1">
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onItemPress?.(item)}
              className="flex-row items-center gap-2 py-1"
              style={{ opacity: item.opacity ?? 1 }}>
              <View className="h-2.5 w-2.5 rounded-full bg-icon-low" />
              <Text variant="bodyXs" className="flex-1">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action button */}
        <Button variant="primary" className="w-full" onPress={onActionPress}>
          <Text>{actionLabel}</Text>
        </Button>
      </View>
    );
  }
);

ResumeCard.displayName = 'ResumeCard';
