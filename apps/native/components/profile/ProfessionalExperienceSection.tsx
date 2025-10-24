import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useQuery } from 'convex/react';

import { Text } from '~/components/ui/text';
import ArrowUpToLine from '~/lib/icons/ArrowUpToLine';
import { ListItem } from '~/components/ui/list-item';
import { TabbedView } from '~/components/ui/tabs/TabbedView';
import { ProjectEditSheet } from '~/components/projects/ProjectEditSheet';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { Button } from '../ui/button';
import { Icon } from '~/lib/icons/Icon';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

// Map display tab names to project types
const TAB_TO_TYPE_MAP: Record<string, string> = {
  'Television/Film': 'tv-film',
  'Music Videos': 'music-video',
  'Live/Stage Performance': 'live-performance',
};

const TABS = ['Television/Film', 'Music Videos', 'Live/Stage Performance'];

export function ProfessionalExperienceSection({
  isHeaderOpen,
  onHeaderChangeIntent,
}: {
  isHeaderOpen: boolean;
  onHeaderChangeIntent: () => void;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | undefined>(undefined);

  // Rotation animation for the button
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(isHeaderOpen ? 0 : 180, { duration: 300 });
  }, [isHeaderOpen]);

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

  return (
    <View className="gap-6">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text variant="header4" className="text-text-default">
          Professional Experience
        </Text>
        <Button onPress={onHeaderChangeIntent} variant="tertiary" size="icon">
          <Animated.View style={animatedIconStyle}>
            <ArrowUpToLine className="text-text-default" size={20} />
          </Animated.View>
        </Button>
      </View>

      {/* Tabbed Content */}
      <TabbedView tabs={TABS}>
        {(activeTab) => {
          const experiences = getExperiencesForTab(activeTab);

          return (
            <View className="gap-4 py-2">
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
          );
        }}
      </TabbedView>

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
