import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
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

interface ExperienceItem {
  id: string;
  organizer: string;
  title: string;
}

// Header component (title + button + tabs)
export function ProfessionalExperienceHeader({
  isCardsOpen,
  onToggle,
  activeTab,
  onTabChange,
}: {
  isCardsOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
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

  return (
    <View className="gap-3 py-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4">
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
      <SearchTabs tabs={TABS} activeTab={activeTab} onTabChange={onTabChange} />
    </View>
  );
}

// List component (scrollable experience items)
export function ProfessionalExperienceList({
  experiences,
  onItemPress,
}: {
  experiences: ExperienceItem[];
  onItemPress: (id: string) => void;
}) {
  return (
    <View className="gap-4 px-4 py-2 pb-32">
      {experiences.map((item) => (
        <ListItem
          key={item.id}
          variant="Experience"
          organizer={item.organizer}
          title={item.title}
          onPress={() => onItemPress(item.id)}
        />
      ))}
    </View>
  );
}

// Hook to manage professional experience data and state
export function useProfessionalExperience() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  // Fetch real projects from Convex
  const myProjects = useQuery(api.projects.getMyProjects, {});

  // Group projects by type for each tab
  const getExperiencesForTab = (tabName: string): ExperienceItem[] => {
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

  const handleItemPress = (id: string) => {
    setSelectedProjectId(id as Id<'projects'>);
    setIsSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setSelectedProjectId(undefined);
    }
  };

  return {
    activeTab,
    setActiveTab,
    experiences,
    handleItemPress,
    isSheetOpen,
    selectedProjectId,
    handleSheetClose,
  };
}

// Sheet component for editing projects
export function ProfessionalExperienceSheet({
  isOpen,
  onOpenChange,
  projectId,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: Id<'projects'>;
}) {
  return <ProjectEditSheet isOpen={isOpen} onOpenChange={onOpenChange} projectId={projectId} />;
}

// Export TABS constant for external use
export { TABS as PROFESSIONAL_EXPERIENCE_TABS };
