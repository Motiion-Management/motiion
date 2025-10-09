import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { type Id } from '@packages/backend/convex/_generated/dataModel'
import { PROJECT_TYPES, PROJECT_TITLE_MAP } from '@packages/backend/convex/schemas/projects'

import { BackgroundGradientView } from '~/components/ui/background-gradient-view'
import { Icon } from '~/lib/icons/Icon'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { SearchTabs } from '~/components/ui/search-tabs'
import { ListItem } from '~/components/ui/list-item'
import { Input } from '~/components/ui/input'

type ProjectType = (typeof PROJECT_TYPES)[number] | 'all'

function ProjectsHeader() {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-4 pb-4">
        <Button onPress={handleClose} variant="tertiary">
          <Icon name="chevron.left" size={24} className="text-icon-default" />
        </Button>
        <Text variant="header4">Projects</Text>
        <Button variant="tertiary">
          <Icon name="square.on.square" size={24} className="text-icon-default" />
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default function ProjectsScreen() {
  const { id, category } = useLocalSearchParams<{ id: string; category?: string }>()
  const [activeTab, setActiveTab] = useState<ProjectType>((category as ProjectType) || 'all')
  const [searchQuery, setSearchQuery] = useState('')

  // Map category param to project type
  const getProjectType = (tab: ProjectType): (typeof PROJECT_TYPES)[number] | undefined => {
    if (tab === 'all') return undefined
    return tab as (typeof PROJECT_TYPES)[number]
  }

  // Fetch projects
  const projects = useQuery(
    api.projects.getDancerProjectsByType,
    id
      ? {
          dancerId: id as Id<'dancers'>,
          type: getProjectType(activeTab)
        }
      : 'skip'
  )

  // Tab configuration
  const tabs = ['all', ...PROJECT_TYPES].map((type) => {
    if (type === 'all') return 'All'
    return PROJECT_TITLE_MAP[type as (typeof PROJECT_TYPES)[number]]
  })

  const handleTabChange = (tabLabel: string) => {
    if (tabLabel === 'All') {
      setActiveTab('all')
      return
    }
    // Find the project type that matches this label
    const projectType = PROJECT_TYPES.find((type) => PROJECT_TITLE_MAP[type] === tabLabel)
    if (projectType) {
      setActiveTab(projectType)
    }
  }

  const getActiveTabLabel = () => {
    if (activeTab === 'all') return 'All'
    return PROJECT_TITLE_MAP[activeTab as (typeof PROJECT_TYPES)[number]]
  }

  if (!id) {
    return null
  }

  return (
    <BackgroundGradientView>
      <View className="flex-1">
        <ProjectsHeader />

        {/* Search Tabs */}
        <View className="mb-4">
          <SearchTabs tabs={tabs} activeTab={getActiveTabLabel()} onTabChange={handleTabChange} />
        </View>

        {/* Search Input */}
        <View className="mb-4 px-4">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-surface-high"
          />
        </View>

        {/* Projects List */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <View className="gap-4 pb-8">
            {projects === undefined ? (
              <View className="py-8">
                <Text variant="body" className="text-center text-text-low">
                  Loading projects...
                </Text>
              </View>
            ) : projects.length === 0 ? (
              <View className="py-8">
                <Text variant="body" className="text-center text-text-low">
                  No projects found
                </Text>
              </View>
            ) : (
              projects.map((project) => {
                // Determine organizer and title based on project type
                let organizer = ''
                let title = project.title || 'Untitled Project'

                if (project.type === 'tv-film') {
                  organizer = project.studio || 'Unknown Studio'
                } else if (project.type === 'music-video') {
                  organizer = project.artists?.join(', ') || 'Unknown Artist'
                } else if (project.type === 'commercial') {
                  organizer = project.companyName || 'Unknown Company'
                } else if (project.type === 'live-performance') {
                  organizer = project.tourArtist || project.venue || 'Unknown Venue'
                }

                return (
                  <ListItem
                    key={project._id}
                    variant="Experience"
                    organizer={organizer}
                    title={title}
                    onPress={() => {
                      // TODO: Navigate to project detail
                      console.log('Project pressed:', project._id)
                    }}
                  />
                )
              })
            )}
          </View>
        </ScrollView>
      </View>
    </BackgroundGradientView>
  )
}
