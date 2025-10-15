import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Icon } from '~/lib/icons/Icon';
import { cn } from '~/lib/utils';

interface ProfileCategoryCardProps {
  title: string;
  count: number;
  onPress?: () => void;
  className?: string;
}

export function ProfileCategoryCard({
  title,
  count,
  onPress,
  className,
}: ProfileCategoryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        'flex-row items-center justify-between rounded-lg border border-border-default bg-surface-default p-4',
        className
      )}>
      <View className="flex-1">
        <Text variant="body" className="font-medium">
          {title}
        </Text>
        <Text variant="footnote" className="text-text-low">
          {count} {count === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <Icon name="chevron.right" size={20} className="text-icon-low" />
    </TouchableOpacity>
  );
}
