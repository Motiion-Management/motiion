import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useQuery } from 'convex/react';

import { Text } from '~/components/ui/text';
import ArrowUpToLine from '~/lib/icons/ArrowUpToLine';
import { ListItem } from '~/components/ui/list-item';
import { SearchTabs } from '~/components/ui/search-tabs';
import { ProjectEditSheet } from '~/components/projects/ProjectEditSheet';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { Button } from '../ui/button';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Map display tab names to project types
const TAB_TO_TYPE_MAP: Record<string, string> = {
  'Television/Film': 'tv-film',
  'Music Videos': 'music-video',
  'Live/Stage Performance': 'live-performance',
};

const TABS = ['Television/Film', 'Music Videos', 'Live/Stage Performance'];

export function ProfessionalExperienceSection({
  isCardsOpen,
  onToggle,
}: {
  isCardsOpen: boolean;
  onToggle: () => void;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  // Rotation animation for the button
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(isCardsOpen ? 0 : 180, { duration: 300 });
  }, [isCardsOpen]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // Fetch real projects from Convex
  const myProjects = useQuery(api.projects.getMyProjects, {});

  // Group projects by type for each tab
  const getExperiencesForTab = (tabName: string) => {
    if (!Array.isArray(myProjects)) return [];

    const projectType = TAB_TO_TYPE_MAP[tabName];
    return myProjects
      .filter((project: any) => project.type === projectType)
      .map((project: any) => ({
        id: project._id,
        organizer: project.production || project.venue || 'Unknown',
        title: project.title || 'Untitled',
      }));
  };

  const experiences = getExperiencesForTab(activeTab);

  return (
    <View className="flex-1 gap-6">
      {/* Header Section */}
      <View className="gap-6 pl-4">
        {/* Header */}
        <View className="flex-row items-center justify-between pr-4">
          <Text variant="header4" className="text-text-default">
            Professional Experience
          </Text>
          <Button onPress={onToggle} variant="tertiary" size="icon">
            <Animated.View style={animatedIconStyle}>
              <ArrowUpToLine className="text-text-default" size={20} />
            </Animated.View>
          </Button>
        </View>

        {/* Tabs */}
        <SearchTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      {/* Scrollable Tab Content */}
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 py-2 pb-32">
          {experiences.map((item) => (
            <ListItem
              key={item.id}
              variant="Experience"
              organizer={item.organizer}
              title={item.title}
              onPress={() => {
                setSelectedProjectId(item.id as Id<'projects'>);
                setIsSheetOpen(true);
              }}
            />
          ))}
        </View>
      </ScrollView>

      {/* Project Edit Sheet */}
      <ProjectEditSheet
        isOpen={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setSelectedProjectId(undefined);
          }
        }}
        projectId={selectedProjectId}
      />
    </View>
  );
}
