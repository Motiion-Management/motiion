import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Sheet, useSheetState } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';

export interface ScheduleItem {
  id: string;
  name: string;
  imageUrl: any;
  type: string;
  typeColor: 'accent' | 'green' | 'orange';
  location: string;
  time: string;
  date: string;
}

interface DayOption {
  label: string;
  value: string;
  dayNumber: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dateRange: string;
  days: DayOption[];
  items: ScheduleItem[];
}

export function ScheduleModal({
  isOpen,
  onClose,
  title,
  dateRange,
  days,
  items,
}: ScheduleModalProps) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.value || '');

  const filteredItems = items.filter((item) => item.date === selectedDay);

  const getTypeColorClass = (color: string) => {
    switch (color) {
      case 'accent':
        return 'text-accent';
      case 'green':
        return 'text-green-500';
      case 'orange':
        return 'text-orange-500';
      default:
        return 'text-accent';
    }
  };

  return (
    <Sheet
      isOpened={isOpen}
      onIsOpenedChange={(open) => {
        if (!open) onClose();
      }}
      label={title}>
      <View className="px-4 pb-8">
        {/* Date range */}
        <Text variant="labelXs" className="mb-6 text-center text-text-low">
          {dateRange}
        </Text>

        {/* Day selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ gap: 12 }}>
          {days.map((day) => (
            <TouchableOpacity
              key={day.value}
              onPress={() => setSelectedDay(day.value)}
              className={`items-center rounded-lg px-4 py-3 ${
                selectedDay === day.value ? 'bg-surface-high' : 'bg-surface-tint'
              }`}>
              <Text variant="labelXs" className="mb-1 text-text-low">
                {day.label}
              </Text>
              <Text variant="header5" className="text-white">
                {day.dayNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Items list */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredItems.map((item) => (
            <View key={item.id} className="mb-6 flex-row gap-4">
              {/* Image */}
              <View className="h-[120px] w-[120px] overflow-hidden rounded">
                <Image source={item.imageUrl} className="h-full w-full" resizeMode="cover" />
              </View>

              {/* Details */}
              <View className="flex-1 justify-center gap-2">
                <Text variant="header5" className="text-white">
                  {item.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text variant="bodySm" className={getTypeColorClass(item.typeColor)}>
                    {item.type}
                  </Text>
                </View>
                <View className="gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text variant="bodySm" className="text-text-low">
                      📍 {item.location}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text variant="bodySm" className="text-text-low">
                      🕐 {item.time}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {filteredItems.length === 0 && (
            <View className="py-8">
              <Text variant="body" className="text-center text-text-low">
                No items scheduled for this day
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Sheet>
  );
}

export function useScheduleModal() {
  const sheetState = useSheetState();
  return sheetState;
}
