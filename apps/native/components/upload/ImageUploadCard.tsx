import { Pressable, View } from 'react-native';

import ImageIcon from '~/lib/icons/Image';
import PlusIcon from '~/lib/icons/Plus';
import { cn } from '~/lib/utils';

interface ImageUploadCardProps {
  onPress: () => void;
  className?: string;
  disabled?: boolean;
  isActive?: boolean;
  shape: 'primary' | 'secondary';
}

export function ImageUploadCard({
  onPress,
  className,
  disabled = false,
  isActive = true,
  shape = 'primary',
}: ImageUploadCardProps) {
  const IconComponent = isActive ? PlusIcon : ImageIcon;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'rounded border border-dashed',
        'flex items-center justify-center',
        shape === 'primary' ? 'h-[234px] w-full' : 'aspect-auto h-[234px]',
        isActive
          ? 'border-border-accent bg-surface-high'
          : 'bg-buton-surface-disabled border-border-disabled',
        disabled && 'opacity-50',
        className
      )}>
      <View className="items-center justify-center">
        <IconComponent
          size={24}
          className={isActive ? 'text-icon-default' : 'text-icon-disabled'}
        />
      </View>
    </Pressable>
  );
}
