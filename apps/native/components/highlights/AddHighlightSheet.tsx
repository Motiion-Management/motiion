import { View, Pressable, ScrollView } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Image } from 'expo-image';
import { useState, useCallback, useRef } from 'react';

import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { ActivityIndicator } from '~/components/ui/activity-indicator';
import { UploadPlaceholder } from '~/components/ui/upload-placeholder';
import { BottomSheetPicker } from '~/components/ui/bottom-sheet-picker';
import { PagerTabView, type TabRoute, type PagerTabViewRef } from '~/components/ui/tabs';
import { useAddHighlight } from '~/hooks/useAddHighlight';
import { cn } from '~/lib/utils';
import { Id } from '@packages/backend/convex/_generated/dataModel';
import { PROJECT_TYPES, PROJECT_TITLE_MAP } from '@packages/backend/convex/schemas/projects';

interface AddHighlightSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  profileId: Id<'dancers'> | null;
}

export function AddHighlightSheet({ isOpen, onOpenChange, profileId }: AddHighlightSheetProps) {
  const [selectedProjectType, setSelectedProjectType] =
    useState<(typeof PROJECT_TYPES)[number]>('tv-film');
  const pagerRef = useRef<PagerTabViewRef>(null);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);
  const { models, actions } = useAddHighlight(profileId, handleClose);

  // Create picker data from PROJECT_TYPES
  const projectTypeData = PROJECT_TYPES.map((type) => ({
    label: PROJECT_TITLE_MAP[type],
    value: type,
  }));

  const projects = useQuery(
    api.projects.getDancerProjectsByType,
    profileId ? { dancerId: profileId, type: selectedProjectType } : 'skip'
  );

  // Define tab routes
  const tabs: TabRoute[] = [
    { key: 'select-project', title: 'Select Project' },
    { key: 'add-cover', title: 'Add Cover' },
  ];

  // Handle Next button - updates hook state AND pager view
  const handleNext = useCallback(() => {
    actions.handleNextTab();
    pagerRef.current?.setPage(1);
  }, [actions]);

  // Determine button text and action
  const buttonText = models.currentTab === 'select-project' ? 'Next' : 'Add Highlight';
  const buttonAction = models.currentTab === 'select-project' ? handleNext : actions.handleSubmit;
  const buttonDisabled =
    models.currentTab === 'select-project' ? !models.canProceedToNextTab : !models.canSubmit;

  // Render scene for each tab
  const renderScene = useCallback(
    (route: TabRoute) => {
      if (route.key === 'select-project') {
        return (
          <ScrollView className="flex-1 px-4 py-6">
            {/* Project Type Filter */}
            <View className="mb-6">
              <BottomSheetPicker
                label="Project Type"
                value={selectedProjectType}
                onChange={setSelectedProjectType}
                data={projectTypeData}
                placeholder="Select project type"
              />
            </View>

            {/* Projects List */}
            <View className="gap-4">
              {projects === undefined ? (
                <View className="items-center justify-center py-8">
                  <ActivityIndicator size="large" />
                </View>
              ) : projects.length === 0 ? (
                <View className="items-center justify-center py-8">
                  <Text variant="body" className="text-text-low">
                    No projects found. Add a project to create highlights.
                  </Text>
                </View>
              ) : (
                projects.map((project) => {
                  const isSelected = models.selectedProjectId === project._id;
                  const displayTitle = project.title || 'Untitled Project';
                  const displaySubtitle =
                    project.studio ||
                    project.artists?.[0] ||
                    project.tourArtist ||
                    project.companyName ||
                    '';

                  return (
                    <Pressable
                      key={project._id}
                      onPress={() => actions.selectProject(project._id)}
                      className="flex-row items-center gap-4">
                      {/* Project thumbnail placeholder */}
                      <View className="h-12 w-12 items-center justify-center rounded bg-surface-tint">
                        <Text variant="label" className="text-text-low">
                          {displayTitle.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>

                      {/* Project info */}
                      <View className="flex-1 gap-1">
                        {displaySubtitle && (
                          <Text variant="label" className="uppercase text-text-low">
                            {displaySubtitle}
                          </Text>
                        )}
                        <Text variant="body" className="text-text-default">
                          {displayTitle}
                        </Text>
                      </View>

                      {/* Radio button */}
                      <View
                        className={cn(
                          'h-7 w-7 items-center justify-center rounded-full border-2',
                          isSelected
                            ? 'border-border-accent bg-transparent'
                            : 'border-border-default bg-transparent'
                        )}>
                        {isSelected && (
                          <View className="h-3.5 w-3.5 rounded-full bg-border-accent" />
                        )}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          </ScrollView>
        );
      }

      if (route.key === 'add-cover') {
        return (
          <ScrollView className="flex-1 px-4 py-6">
            <View className="gap-6">
              <Text variant="label" className="uppercase text-text-default">
                Add a cover photo
              </Text>

              <View className="gap-4">
                {models.uploadedImageId ? (
                  <View className="h-[234px] w-[177px]">
                    <Image
                      source={{ uri: models.uploadedImageId }}
                      contentFit="cover"
                      style={{ width: '100%', height: '100%' }}
                      className="rounded-lg"
                    />
                  </View>
                ) : (
                  <UploadPlaceholder
                    onPress={actions.handleImageUpload}
                    disabled={models.isUploading}
                    height={234}
                  />
                )}
              </View>

              {models.isUploading && (
                <View className="items-center">
                  <ActivityIndicator size="small" />
                  <Text variant="label" className="mt-2 text-text-low">
                    Uploading... {models.uploadProgress}%
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        );
      }

      return null;
    },
    [selectedProjectType, projectTypeData, projects, models, actions]
  );

  return (
    <Sheet
      isOpened={isOpen}
      label="Add Highlight"
      onIsOpenedChange={onOpenChange}
      enableContentPanningGesture={false}>
      <View className="h-[80vh]">
        <PagerTabView
          ref={pagerRef}
          routes={tabs}
          renderScene={renderScene}
          initialKey="select-project"
          tabStyle="text"
          tabContainerClassName="border-b border-border-tint px-4"
          onIndexChange={(index, key) => {
            actions.setCurrentTab(key as 'select-project' | 'add-cover');
          }}
        />

        {/* Bottom Button */}
        <View className="border-t border-border-tint px-4 pb-4 pt-4">
          <Button onPress={buttonAction} disabled={buttonDisabled} className="w-full">
            <Text variant="header5" className="text-text-high">
              {buttonText}
            </Text>
          </Button>
        </View>
      </View>
    </Sheet>
  );
}
