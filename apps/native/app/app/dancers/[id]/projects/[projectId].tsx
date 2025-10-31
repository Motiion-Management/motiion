import React from 'react';
import { View, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';

import { Text } from '~/components/ui/text';
import { PagerTabView, type TabRoute } from '~/components/ui/tabs/PagerTabView';
import { PictureCard } from '~/components/ui/picture-card';
import { ListActivity } from '~/components/ui/list-activity';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { getInitials, getRoleLabel, getCategoryInfo, formatProjectDate } from '~/lib/project-utils';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

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

  // Helper functions to check if tabs have content
  const hasTeamContent = () => {
    const teamFields = [
      project.mainTalent,
      project.choreographers,
      project.associateChoreographers,
      project.directors,
    ];
    return teamFields.some((field) => field && field.length > 0);
  };

  const hasDetailsContent = () => {
    const details = [
      formatProjectDate(project.startDate),
      formatProjectDate(project.endDate),
      project.duration,
      project.productionCompany,
    ];
    return details.some((detail) => detail && detail !== '-');
  };

  const hasLinkContent = () => {
    return !!project.link;
  };

  // Build tabs array with only tabs that have content
  const tabs: Array<TabRoute> = [];

  if (hasTeamContent()) {
    tabs.push({ key: 'team', title: 'Team' });
  }

  if (hasDetailsContent()) {
    tabs.push({ key: 'details', title: 'Details' });
  }

  if (hasLinkContent()) {
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
      </View>

      {/* Tabs - Only show if there are tabs with content */}
      {tabs.length > 0 && (
        <>
          {tabs.length === 1 ? (
            // Single tab: show as header only
            <View style={{ flex: 1 }} className="gap-4">
              <Text variant="header5" className="px-6 text-text-low">
                {tabs[0].title}
              </Text>
              <View style={{ flex: 1 }}>{renderScene(tabs[0])}</View>
            </View>
          ) : (
            // Multiple tabs: show PagerTabView
            <View style={{ flex: 1 }}>
              <PagerTabView
                routes={tabs}
                renderScene={renderScene}
                initialKey={tabs[0].key}
                tabStyle="pill"
                tabContainerClassName="px-6"
              />
            </View>
          )}
        </>
      )}
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
      <View className="px-6 py-8">
        <Text variant="body" className="text-center text-text-low">
          No team information available
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-8 px-6">
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
                    <Avatar alt={`Avatar for ${name}`} className="h-8 w-8">
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
  const startDate = formatProjectDate(project.startDate);
  const endDate = formatProjectDate(project.endDate);
  const duration = project.duration;
  const productionCompany = project.productionCompany;

  const hasStartDate = startDate && startDate !== '-';
  const hasEndDate = endDate && endDate !== '-';
  const hasDuration = duration && duration !== '-';
  const hasProductionCompany = productionCompany && productionCompany !== '-';

  const hasAnyDetails = hasStartDate || hasEndDate || hasDuration || hasProductionCompany;

  if (!hasAnyDetails) {
    return (
      <View className="px-6 py-8">
        <Text variant="body" className="text-center text-text-low">
          No additional details available
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-6 px-6">
      {hasStartDate && hasEndDate ? (
        <DateRangeField startDate={startDate} endDate={endDate} />
      ) : (
        <>
          {hasStartDate && <DetailField label="Start Date" value={startDate} />}
          {hasEndDate && <DetailField label="End Date" value={endDate} />}
        </>
      )}
      {hasDuration && <DetailField label="Duration" value={duration} />}
      {hasProductionCompany && <DetailField label="Production Company" value={productionCompany} />}
    </View>
  );
}

// Detail Field Component
function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-4">
      <Text variant="labelSm" className="uppercase text-text-low">
        {label}
      </Text>
      <View className="h-px w-full bg-border-tint" />
      <Text variant="body" className="text-text-default">
        {value}
      </Text>
    </View>
  );
}

// Date Range Field Component (side-by-side dates)
function DateRangeField({ startDate, endDate }: { startDate: string; endDate: string }) {
  return (
    <View className="gap-4">
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text variant="labelSm" className="uppercase text-text-low">
            Start Date
          </Text>
        </View>
        <View className="flex-1">
          <Text variant="labelSm" className="uppercase text-text-low">
            End Date
          </Text>
        </View>
      </View>
      <View className="h-px w-full bg-border-tint" />
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text variant="body" className="text-text-default">
            {startDate}
          </Text>
        </View>
        <View className="flex-1">
          <Text variant="body" className="text-text-default">
            {endDate}
          </Text>
        </View>
      </View>
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
    <View className="gap-6 px-6">
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
