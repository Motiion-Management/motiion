import type { ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

import { Text } from '~/components/ui/text';
import { Icon } from '~/lib/icons/Icon';
import { cn } from '~/lib/utils';

type ActivityType = 'Session' | 'Class' | 'Job';

interface ListActivityProps extends ViewProps {
  category: string;
  activityType?: ActivityType;
  activityLabel: string;
}

export const ListActivity = React.forwardRef<ViewRef, ListActivityProps>(
  ({ className, category, activityType = 'Job', activityLabel, ...props }, ref) => {
    const activityColor =
      activityType === 'Session'
        ? 'text-[#cc00be]'
        : activityType === 'Class'
          ? 'text-[#00cc55]'
          : 'text-[#4fcfcf]';

    return (
      <View ref={ref} className={cn('w-full flex-col', className)} {...props}>
        <Text variant="labelSm" className="mb-1 uppercase text-text-low">
          Category
        </Text>
        <View className="h-px w-full bg-border-tint" />
        <View className="flex-col gap-2 py-3">
          <Text variant="bodySm" className="text-text-default">
            {category}
          </Text>
          <View className="flex-row items-center gap-1">
            <Icon name="arrow.turn.down.right" size={16} className="text-icon-low" />
            <Text variant="bodyLg" className={cn('font-normal', activityColor)}>
              {activityLabel}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

ListActivity.displayName = 'ListActivity';
