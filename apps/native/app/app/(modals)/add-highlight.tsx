import { View, Pressable, ScrollView } from 'react-native'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Image } from 'expo-image'
import { useState } from 'react'

import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { ActivityIndicator } from '~/components/ui/activity-indicator'
import { UploadPlaceholder } from '~/components/ui/upload-placeholder'
import { BottomSheetPicker } from '~/components/ui/bottom-sheet-picker'
import { useAddHighlight } from '~/hooks/useAddHighlight'
import { useSharedUser } from '~/contexts/SharedUserContext'
import { cn } from '~/lib/utils'
import XIcon from '~/lib/icons/X'
import ChevronLeftIcon from '~/lib/icons/ChevronLeft'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { PROJECT_TYPES, PROJECT_TITLE_MAP } from '@packages/backend/convex/schemas/projects'

export default function AddHighlightModal() {
  const { user } = useSharedUser()
  const profileId = user?.activeDancerId ?? null
  const [selectedProjectType, setSelectedProjectType] = useState<typeof PROJECT_TYPES[number]>('tv-film')

  const { models, actions } = useAddHighlight(profileId)

  // Create picker data from PROJECT_TYPES
  const projectTypeData = PROJECT_TYPES.map(type => ({
    label: PROJECT_TITLE_MAP[type],
    value: type
  }))

  const projects = useQuery(
    api.projects.getDancerProjectsByType,
    profileId ? { dancerId: profileId, type: selectedProjectType } : 'skip'
  )

  // Determine button text and action
  const buttonText =
    models.currentTab === 'select-project' ? 'Next' : 'Add Highlight'
  const buttonAction =
    models.currentTab === 'select-project'
      ? actions.handleNextTab
      : actions.handleSubmit
  const buttonDisabled =
    models.currentTab === 'select-project'
      ? !models.canProceedToNextTab
      : !models.canSubmit

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="border-b border-border-tint px-4 pb-4 pt-16">
        <View className="flex-row items-center justify-between">
          {models.currentTab === 'add-cover' ? (
            <Pressable onPress={actions.handlePrevTab} className="p-2">
              <ChevronLeftIcon size={28} className="text-white" />
            </Pressable>
          ) : (
            <View className="w-12" />
          )}
          <Text variant="header3" className="text-text-default">
            Add Highlight
          </Text>
          <Pressable onPress={actions.handleClose} className="p-2">
            <XIcon size={28} className="text-white" />
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View className="border-b border-border-tint flex-row gap-4 px-4">
        <Pressable
          onPress={() => models.currentTab === 'add-cover' && actions.handlePrevTab()}
          className={cn(
            'border-b-2 pb-4',
            models.currentTab === 'select-project'
              ? 'border-border-high'
              : 'border-transparent'
          )}>
          <Text
            variant="body"
            className={cn(
              models.currentTab === 'select-project'
                ? 'text-text-default'
                : 'text-text-disabled'
            )}>
            Select Project
          </Text>
        </Pressable>
        <View
          className={cn(
            'border-b-2 pb-4',
            models.currentTab === 'add-cover'
              ? 'border-border-high'
              : 'border-transparent'
          )}>
          <Text
            variant="body"
            className={cn(
              models.currentTab === 'add-cover'
                ? 'text-text-default'
                : 'text-text-disabled'
            )}>
            Add Cover
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {models.currentTab === 'select-project' ? (
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
                  const isSelected = models.selectedProjectId === project._id
                  const displayTitle = project.title || 'Untitled Project'
                  const displaySubtitle =
                    project.studio ||
                    project.artists?.[0] ||
                    project.tourArtist ||
                    project.companyName ||
                    ''

                  return (
                    <Pressable
                      key={project._id}
                      onPress={() => actions.selectProject(project._id)}
                      className="flex-row items-center gap-4">
                      {/* Project thumbnail placeholder */}
                      <View className="bg-surface-tint h-12 w-12 items-center justify-center rounded">
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
                          <View className="bg-border-accent h-3.5 w-3.5 rounded-full" />
                        )}
                      </View>
                    </Pressable>
                  )
                })
              )}
            </View>
          </ScrollView>
        ) : (
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
        )}
      </View>

      {/* Bottom Button */}
      <View className="border-t border-border-tint px-4 pb-12 pt-4">
        <Button onPress={buttonAction} disabled={buttonDisabled} className="w-full">
          <Text variant="header5" className="text-text-high">
            {buttonText}
          </Text>
        </Button>
      </View>
    </View>
  )
}
