import React from 'react';
import { View, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';

import { Text } from '~/components/ui/text';
import { TabView, type TabRoute } from '~/components/ui/tabs/TabView';
import { PictureCard } from '~/components/ui/picture-card';
import { ListActivity } from '~/components/ui/list-activity';
import { ListItem } from '~/components/ui/list-item';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { getInitials, getRoleLabel, getCategoryInfo, formatProjectDate } from '~/lib/project-utils';

export default function ProjectDetailScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  // Fetch project data
  const project = useQuery(
    api.projects.read,
    projectId ? { id: projectId as Id<'projects'> } : 'skip'
  );

  if (project === undefined) {
    return null; // Loading
  }

  if (project === null) {
    return <Redirect href="../" />;
  }

  const categoryInfo = getCategoryInfo(project);

  // Determine which tabs to show
  const tabs: Array<TabRoute> = [
    { key: 'team', title: 'Team' },
    { key: 'details', title: 'Details' },
  ];

  // Only show Link tab if project has a link
  if (project.link) {
    tabs.push({ key: 'link', title: 'Link' });
  }

  const renderScene = (route: TabRoute) => {
    switch (route.key) {
      case 'team':
        return <TeamTab project={project} />;
      case 'details':
        return <DetailsTab project={project} />;
      case 'link':
        return <LinkTab link={project.link} />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background-gradient-filled">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-8 px-6 py-6">
          {/* Title */}
          <Text variant="header3" className="text-text-default">
            {project.title || 'Untitled Project'}
          </Text>

          {/* Main Details */}
          <View className="flex-row gap-6">
            {/* Picture Card */}
            <PictureCard className="w-[146px]" />

            {/* Details Stack */}
            <View className="flex-1 gap-6">
              {/* Category */}
              <ListActivity
                category={categoryInfo.category}
                activityLabel={categoryInfo.subcategory}
              />

              {/* Role */}
              {project.roles && project.roles.length > 0 && (
                <View className="gap-4">
                  <Text variant="labelSm" className="uppercase text-text-low">
                    Role
                  </Text>
                  <View className="h-px w-full bg-border-tint" />
                  <Text variant="body" className="text-text-default">
                    {project.roles.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Tabs */}
          <TabView
            routes={tabs}
            renderScene={renderScene}
            initialKey="team"
            tabStyle="pill"
            tabContainerClassName="sticky top-0 bg-background-gradient-filled"
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Team Tab Component
function TeamTab({ project }: { project: any }) {
  const teamFields = [
    { key: 'mainTalent', data: project.mainTalent },
    { key: 'choreographers', data: project.choreographers },
    { key: 'associateChoreographers', data: project.associateChoreographers },
    { key: 'directors', data: project.directors },
  ];

  const hasTeamData = teamFields.some((field) => field.data && field.data.length > 0);

  if (!hasTeamData) {
    return (
      <View className="py-8">
        <Text variant="body" className="text-center text-text-low">
          No team information available
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-8">
      {teamFields.map(
        (field) =>
          field.data &&
          field.data.length > 0 && (
            <View key={field.key} className="gap-4">
              <Text variant="labelSm" className="uppercase text-text-low">
                {getRoleLabel(field.key)}
              </Text>
              <View className="h-px w-full bg-border-tint" />
              <View className="gap-3">
                {field.data.map((name: string, index: number) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Text variant="bodySm" className="text-text-default">
                          {getInitials(name)}
                        </Text>
                      </AvatarFallback>
                    </Avatar>
                    <Text variant="body" className="text-text-default">
                      {name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )
      )}
    </View>
  );
}

// Details Tab Component
function DetailsTab({ project }: { project: any }) {
  const details = [
    { label: 'Start Date', value: formatProjectDate(project.startDate) },
    { label: 'End Date', value: formatProjectDate(project.endDate) },
    { label: 'Duration', value: project.duration },
    { label: 'Production Company', value: project.productionCompany },
  ];

  const visibleDetails = details.filter((detail) => detail.value && detail.value !== '-');

  if (visibleDetails.length === 0) {
    return (
      <View className="py-8">
        <Text variant="body" className="text-center text-text-low">
          No additional details available
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-6">
      {visibleDetails.map((detail, index) => (
        <View key={index} className="gap-4">
          <Text variant="labelSm" className="uppercase text-text-low">
            {detail.label}
          </Text>
          <View className="h-px w-full bg-border-tint" />
          <Text variant="body" className="text-text-default">
            {detail.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Link Tab Component
function LinkTab({ link }: { link?: string }) {
  if (!link) {
    return null;
  }

  const handleOpenLink = async () => {
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <View className="gap-6">
      <View className="gap-4">
        <Text variant="labelSm" className="uppercase text-text-low">
          Project Link
        </Text>
        <View className="h-px w-full bg-border-tint" />
        <Button onPress={handleOpenLink} variant="secondary">
          <Text variant="body" className="text-text-default">
            Open Link
          </Text>
        </Button>
      </View>
      <Text variant="bodySm" className="text-text-low">
        {link}
      </Text>
    </View>
  );
}
