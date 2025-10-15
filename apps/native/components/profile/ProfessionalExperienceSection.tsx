import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';

import { Text } from '~/components/ui/text';
import ArrowUpToLine from '~/lib/icons/ArrowUpToLine';
import { ExperienceListItem, type ExperienceItem } from './ExperienceListItem';

type ExperienceType = 'tv-film' | 'music-video' | 'live-performance';

interface PillTabProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

function PillTab({ title, active, onPress }: PillTabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-[27px] px-4 py-1.5 ${
        active ? 'bg-background-accent' : 'bg-surface-tint'
      }`}>
      <Text variant="bodySm" className="text-text-default">
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// Mock data - replace with real data from backend
const MOCK_EXPERIENCES: Record<ExperienceType, ExperienceItem[]> = {
  'tv-film': [
    {
      id: '1',
      studio: 'Netflix',
      title: 'A Nonsense Christmas',
    },
    {
      id: '2',
      studio: 'Studio',
      title: 'Project Title',
    },
    {
      id: '3',
      studio: 'Studio',
      title: 'Project Title',
    },
    {
      id: '4',
      studio: 'Studio',
      title: 'Project Title',
    },
  ],
  'music-video': [
    {
      id: '5',
      studio: 'Record Label',
      title: 'Music Video Title',
    },
    {
      id: '6',
      studio: 'Record Label',
      title: 'Music Video Title',
    },
  ],
  'live-performance': [
    {
      id: '7',
      studio: 'Venue',
      title: 'Performance Title',
    },
    {
      id: '8',
      studio: 'Venue',
      title: 'Performance Title',
    },
  ],
};

export function ProfessionalExperienceSection() {
  const [activeTab, setActiveTab] = useState<ExperienceType>('tv-film');

  const experiences = MOCK_EXPERIENCES[activeTab] || [];

  return (
    <View className="gap-6">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text variant="header4" className="text-text-default">
          Professional Experience
        </Text>
        <ArrowUpToLine className="text-text-default" />
      </View>

      {/* Pill Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2">
        <PillTab
          title="Television/Film"
          active={activeTab === 'tv-film'}
          onPress={() => setActiveTab('tv-film')}
        />
        <PillTab
          title="Music Videos"
          active={activeTab === 'music-video'}
          onPress={() => setActiveTab('music-video')}
        />
        <PillTab
          title="Live/Stage Performance"
          active={activeTab === 'live-performance'}
          onPress={() => setActiveTab('live-performance')}
        />
      </ScrollView>

      {/* Experience List */}
      <View className="gap-0 py-2">
        {experiences.map((item, index) => (
          <ExperienceListItem
            key={item.id}
            item={item}
            showDivider={index < experiences.length - 1}
            onPress={() => {
              // TODO: Navigate to project detail page
              console.log('View project:', item.id);
            }}
          />
        ))}
      </View>
    </View>
  );
}
