import React from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import Calendar from '~/lib/icons/Calendar';

export interface SessionItem {
  id: string;
  name: string;
  imageUrl: any;
  date: {
    day: string;
    month: string;
  };
}

interface InSessionSectionProps {
  items?: SessionItem[];
  onViewAllPress?: () => void;
}

export function InSessionSection({ items = [], onViewAllPress }: InSessionSectionProps) {
  const renderItem = ({ item }: { item: SessionItem }) => (
    <View className="mr-4">
      <View className="relative h-[200px] w-[140px] overflow-hidden rounded border border-border-tint">
        <Image source={item.imageUrl} className="h-full w-full" resizeMode="cover" />
        {/* Calendar badge */}
        <View className="absolute bottom-2 left-2">
          <View className="items-center">
            <Text variant="header3" className="mb-[-2px] text-white">
              {item.date.day}
            </Text>
            <Text variant="labelXs" className="text-white">
              {item.date.month}
            </Text>
          </View>
        </View>
      </View>
      <Text variant="bodySm" className="mt-4 text-white">
        {item.name}
      </Text>
    </View>
  );

  return (
    <View>
      {/* Section heading */}
      <View className="mb-7 flex-row items-start justify-between px-4">
        <View className="gap-1">
          <Text variant="header4" className="text-white">
            In Session
          </Text>
          <Text variant="body" className="text-text-low">
            Studio time to assist creation & move.
          </Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress} className="h-7 w-7 items-center justify-center">
          <Calendar className="h-7 w-7 text-white" />
        </TouchableOpacity>
      </View>

      {/* Horizontal scrollable list */}
      <FlatList
        data={items}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
