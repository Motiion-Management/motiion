import React, { useState, useMemo } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm'
import { ExperienceTypeSelector } from './ExperienceTypeSelector'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { 
  getExperienceMetadata, 
  tvFilmMetadata,
  musicVideoMetadata,
  livePerformanceMetadata,
  commercialMetadata 
} from '~/utils/convexFormMetadata'

// Import Convex validators
import { zExperiencesTvFilm } from '@packages/backend/convex/validators/experiencesTvFilm'
import { zExperiencesMusicVideos } from '@packages/backend/convex/validators/experiencesMusicVideos'
import { zExperiencesLivePerformances } from '@packages/backend/convex/validators/experiencesLivePerformances'
import { zExperiencesCommercials } from '@packages/backend/convex/validators/experiencesCommercials'

// Map experience types to schemas
const experienceSchemas = {
  'tv-film': zExperiencesTvFilm,
  'music-video': zExperiencesMusicVideos,
  'live-performance': zExperiencesLivePerformances,
  'commercial': zExperiencesCommercials,
}

// Map experience types to metadata
const experienceMetadataMap = {
  'tv-film': tvFilmMetadata,
  'music-video': musicVideoMetadata,
  'live-performance': livePerformanceMetadata,
  'commercial': commercialMetadata,
}

interface Tab {
  id: string
  label: string
  groups: string[]
}

const tabs: Tab[] = [
  { id: 'details', label: 'Details', groups: ['details', 'basic', 'dates', 'media'] },
  { id: 'team', label: 'Team', groups: ['team', 'details'] },
]

interface TabbedExperienceFormProps {
  mode: 'create' | 'edit'
  initialType?: string
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => void
  onDelete?: () => void
}

/**
 * Master form component for creating/editing experiences
 * Handles type selection, dynamic schema loading, and tabbed interface
 */
export function TabbedExperienceForm({
  mode,
  initialType,
  initialData = {},
  onSubmit,
  onDelete,
}: TabbedExperienceFormProps) {
  const [selectedType, setSelectedType] = useState<string | undefined>(initialType)
  const [activeTab, setActiveTab] = useState('details')
  const [formData, setFormData] = useState<Record<string, any>>(initialData)

  // Get schema and metadata based on selected type
  const schema = useMemo(() => {
    if (!selectedType) return null
    return experienceSchemas[selectedType as keyof typeof experienceSchemas]
  }, [selectedType])

  const metadata = useMemo(() => {
    if (!selectedType) return {}
    return experienceMetadataMap[selectedType as keyof typeof experienceMetadataMap] || {}
  }, [selectedType])

  const currentTab = tabs.find(t => t.id === activeTab)

  const handleNext = () => {
    if (activeTab === 'details') {
      setActiveTab('team')
    }
  }

  const handleSave = () => {
    // Add the type to the form data
    const dataWithType = {
      ...formData,
      type: selectedType,
    }
    onSubmit(dataWithType)
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text variant="heading" className="text-2xl">
            {mode === 'create' ? 'Add Experience' : 'Edit Experience'}
          </Text>
        </View>

        {/* Type Selector */}
        <View className="mb-6">
          <ExperienceTypeSelector
            value={selectedType}
            onChange={setSelectedType}
            readOnly={mode === 'edit'}
          />
        </View>

        {/* Only show form after type is selected */}
        {selectedType && schema && (
          <>
            {/* Tab Navigation */}
            <View className="mb-6 flex-row gap-2">
              {tabs.map(tab => (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className="flex-1 border-b-2 pb-2"
                  style={{
                    borderBottomColor: activeTab === tab.id ? '#fff' : 'transparent'
                  }}
                >
                  <Text 
                    className={`text-center ${
                      activeTab === tab.id 
                        ? 'text-text-default font-semibold' 
                        : 'text-text-secondary'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Dynamic Form */}
            <ConvexDynamicForm
              schema={schema}
              metadata={metadata}
              groups={currentTab?.groups}
              initialData={formData}
              onChange={setFormData}
              exclude={['userId', 'private', 'type']}
              debounceMs={300}
            />

            {/* Action Buttons */}
            <View className="mt-8 gap-4">
              {activeTab === 'details' ? (
                <Button onPress={handleNext}>
                  <Text>Next</Text>
                </Button>
              ) : (
                <>
                  <Button onPress={handleSave}>
                    <Text>Save</Text>
                  </Button>
                  
                  {mode === 'edit' && onDelete && (
                    <Button 
                      variant="destructive"
                      onPress={onDelete}
                    >
                      <Text>Delete</Text>
                    </Button>
                  )}
                </>
              )}
            </View>
          </>
        )}

        {/* Debug Info (remove in production) */}
        <View className="mt-8 rounded-lg bg-surface-high p-4">
          <Text variant="footnote" className="mb-2 text-text-disabled">
            Mode: {mode} | Type: {selectedType || 'none'} | Tab: {activeTab}
          </Text>
          <Text variant="footnote" className="text-text-disabled">
            Fields: {Object.keys(formData).join(', ') || 'none'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}