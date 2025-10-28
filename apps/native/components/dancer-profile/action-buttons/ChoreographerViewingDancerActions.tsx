import React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Icon } from '~/lib/icons/Icon';
import { Text } from '~/components/ui/text';

interface ChoreographerViewingDancerActionsProps {
  onBookPress: () => void;
  onAddPress: () => void;
  onRequestPress: () => void;
}

export function ChoreographerViewingDancerActions({
  onBookPress,
  onAddPress,
  onRequestPress,
}: ChoreographerViewingDancerActionsProps) {
  return (
    <>
      {/* Book Button - Primary/Accent */}
      <View className="items-center gap-2">
        <Button
          variant="accent"
          size="icon"
          onPress={onBookPress}
          className="h-[58px] w-[58px] rounded-[46px] shadow-md">
          <Icon name="calendar.badge.plus" size={28} className="text-icon-default" />
        </Button>
        <Text className="text-[10px] font-medium uppercase tracking-[0.6px] text-white">Book</Text>
      </View>

      {/* Add Button */}
      <View className="items-center gap-2">
        <Button
          variant="tertiary"
          size="icon"
          onPress={onAddPress}
          className="h-[58px] w-[58px] rounded-[46px] shadow-md">
          <Icon name="plus" size={28} className="text-icon-default" />
        </Button>
        <Text className="text-[10px] font-medium uppercase tracking-[0.6px] text-white">Add</Text>
      </View>

      {/* Request Button */}
      <View className="items-center gap-2">
        <Button
          variant="tertiary"
          size="icon"
          onPress={onRequestPress}
          className="h-[58px] w-[58px] rounded-[46px] shadow-md">
          <Icon name="bell.fill" size={28} className="text-icon-default" />
        </Button>
        <Text className="text-[10px] font-medium uppercase tracking-[0.6px] text-white">
          Request
        </Text>
      </View>
    </>
  );
}
