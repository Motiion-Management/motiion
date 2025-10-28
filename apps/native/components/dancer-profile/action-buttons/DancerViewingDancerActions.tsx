import React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Icon } from '~/lib/icons/Icon';
import { Text } from '~/components/ui/text';

interface DancerViewingDancerActionsProps {
  onAddPress: () => void;
  onFavoritePress: () => void;
  isFavorited?: boolean;
}

export function DancerViewingDancerActions({
  onAddPress,
  onFavoritePress,
  isFavorited = false,
}: DancerViewingDancerActionsProps) {
  return (
    <>
      {/* Add Button */}
      <View className="items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onPress={onAddPress}
          className="h-[58px] w-[58px] rounded-[46px] shadow-md">
          <Icon name="plus" size={28} className="text-icon-default" />
        </Button>
        <Text className="text-[10px] font-medium uppercase tracking-[0.6px] text-white">Add</Text>
      </View>

      {/* Favorite Button */}
      <View className="items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onPress={onFavoritePress}
          className="h-[58px] w-[58px] rounded-[46px] shadow-md">
          <Icon
            name={isFavorited ? 'heart.fill' : 'heart'}
            size={28}
            className="text-icon-default"
          />
        </Button>
        <Text className="text-[10px] font-medium uppercase tracking-[0.6px] text-white">
          Favorite
        </Text>
      </View>
    </>
  );
}
